#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "time.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <HTTPClient.h>
#include <Adafruit_BME280.h>

// ======================= CONFIG =======================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// === SENSOR PINS ===
#define MQ6_PIN 35
#define UV_PIN 32

// === CREATE SENSOR OBJECTS ===
Adafruit_BME280 bme;

// Wi-Fi settings
const char* ssid = "Youcode";
const char* password = "Youcode@2024";

// Server settings
const char* ws_server = "192.168.8.110";
const int ws_port = 8080;
const char* ws_path = "/ws-native";

WebSocketsClient webSocket;
bool isStompConnected = false;

// NTP settings
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 0;

// ======================= FUNCTIONS =======================

void sendMacToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String mac = WiFi.macAddress();
    String serverUrl = "http://" + String(ws_server) + ":" + String(ws_port) + "/api/station/esp32/saveMac";

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<100> json;
    json["mac"] = mac;
    String requestBody;
    serializeJson(json, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      Serial.printf("MAC sent! Response: %d\n", httpResponseCode);
      Serial.println(http.getString());
    } else {
      Serial.printf("Error sending MAC: %d\n", httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi not connected, cannot send MAC.");
  }
}

void initTime() {
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time...");
  time_t now_sec = time(nullptr);
  while (now_sec < 100000) {
    delay(500);
    Serial.print(".");
    now_sec = time(nullptr);
  }
  Serial.println("\nTime initialized!");
}

String getISO8601Time() {
  time_t now_sec = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now_sec, &timeinfo);
  char buffer[25];
  sprintf(buffer, "%04d-%02d-%02dT%02d:%02d:%02d",
          timeinfo.tm_year + 1900,
          timeinfo.tm_mon + 1,
          timeinfo.tm_mday,
          timeinfo.tm_hour,
          timeinfo.tm_min,
          timeinfo.tm_sec);
  return String(buffer);
}

void sendStompFrame(String frame) {
  frame += '\0';
  webSocket.sendTXT(frame);
}

// ---------------- WebSocket Events ----------------
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected.");
      isStompConnected = false;
      break;

    case WStype_CONNECTED:
      Serial.println("WebSocket Connected!");
      {
        String connectFrame = "CONNECT\n";
        connectFrame += "accept-version:1.2\n";
        connectFrame += "host:" + String(ws_server) + "\n\n";
        sendStompFrame(connectFrame);
      }
      break;

    case WStype_TEXT:
      Serial.print("Received: ");
      Serial.println((char*)payload);

      if (String((char*)payload).startsWith("CONNECTED")) {
        Serial.println("STOMP Connection Successful!");
        isStompConnected = true;

        String subscribeFrame = "SUBSCRIBE\n";
        subscribeFrame += "id:sub-0\n";
        subscribeFrame += "destination:/topic/data\n\n";
        sendStompFrame(subscribeFrame);
      }
      break;

    case WStype_ERROR:
      Serial.println("WebSocket Error!");
      isStompConnected = false;
      break;

    default:
      break;
  }
}

// === SENSOR FUNCTIONS ===
float readUV() {
  int rawValue = analogRead(UV_PIN);
  float voltage = (rawValue / 4095.0) * 3.3;
  float uvIndex = (voltage - 1.0) / 0.1;
  if (uvIndex < 0) uvIndex = 0;
  if (uvIndex > 15) uvIndex = 15;
  return uvIndex;
}

int lastMQ6Reading = 0;
int readMQ6_Raw() {
  int sum = 0;
  for (int i = 0; i < 20; i++) sum += analogRead(MQ6_PIN);
  lastMQ6Reading = sum / 20;
  return lastMQ6Reading;
}
float readMQ6_CO2() {
  float gas_ppm = map(lastMQ6Reading, 100, 1000, 200, 5000);
  if (gas_ppm < 200) gas_ppm = 200;
  if (gas_ppm > 10000) gas_ppm = 10000;
  return gas_ppm;
}
float readMQ6_Gas() {
  float gas_quality = map(lastMQ6Reading, 100, 1000, 0, 100);
  if (gas_quality < 0) gas_quality = 0;
  if (gas_quality > 100) gas_quality = 100;
  return gas_quality;
}

// ---------------- OLED DISPLAY ----------------
void displayStatus(float temp, float hum, float press, float co2, float gas, float uv) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);

  display.print("IP:"); display.println(WiFi.localIP());
  display.print("MAC:"); display.println(WiFi.macAddress());
  display.print("T:"); display.print(temp, 1); display.print("C H:"); display.println(hum,0);
  display.print("P:"); display.print(press,0); display.println("hPa");
  display.print("CO2:"); display.print(co2,0); display.println("ppm");
  display.print("Gas:"); display.print(gas,0); display.print("% UV:"); display.println(uv,1);
  display.display();
}

// ======================= SETUP =======================
void setup() {
  Serial.begin(115200);
  delay(1000);

  // OLED init
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Sensor pins
  pinMode(UV_PIN, INPUT);
  pinMode(MQ6_PIN, INPUT);
  analogSetAttenuation(ADC_11db);

  // BME280 init
  if (!bme.begin(0x76) && !bme.begin(0x77)) {
    Serial.println("BME280 not detected!");
  }

  // Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println(); Serial.println(WiFi.localIP());

  sendMacToServer();
  initTime();

  // WebSocket
  webSocket.begin(ws_server, ws_port, ws_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

// ======================= LOOP =======================
void loop() {
  webSocket.loop();

  // Read sensors
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0;
  float uv = readUV();
  readMQ6_Raw();
  float co2 = readMQ6_CO2();
  float gas = readMQ6_Gas();

  // Display
  displayStatus(temperature, humidity, pressure, co2, gas, uv);

  // Send data every 2 sec
  static unsigned long lastSend = 0;
  if (isStompConnected && millis() - lastSend > 2000) {
    lastSend = millis();

    StaticJsonDocument<400> json;
    json["mac"] = WiFi.macAddress();
    json["temp"] = temperature;
    json["humidity"] = humidity;
    json["pression"] = pressure;
    json["co2"] = co2;
    json["gas"] = gas;
    json["uv"] = uv;
    json["timestamp"] = getISO8601Time();

    String payloadJson;
    serializeJson(json, payloadJson);

    String sendFrame = "SEND\n";
    sendFrame += "destination:/app/addData\n";
    sendFrame += "content-type:application/json\n";
    sendFrame += "content-length:" + String(payloadJson.length()) + "\n\n";
    sendFrame += payloadJson;

    sendStompFrame(sendFrame);
    Serial.println("Sent JSON data with real timestamp to Spring Boot!");
  }
}
