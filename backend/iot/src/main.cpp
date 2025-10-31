#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "time.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

const char* ssid = "Youcode";
const char* password = "Youcode@2024";

const char* ws_server = "192.168.8.120";
const int ws_port = 8080;
const char* ws_path = "/ws-native";

WebSocketsClient webSocket;
bool isStompConnected = false;

// NTP Configuration
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 0;

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
        connectFrame += "host:" + String(ws_server) + "\n";
        connectFrame += "\n";
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
        subscribeFrame += "destination:/topic/data\n";
        subscribeFrame += "\n";
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

// ---------------- Setup ----------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  // OLED Initialization
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());

  initTime();

  webSocket.begin(ws_server, ws_port, ws_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

// ---------------- Display Info ----------------
void displayStatus() {
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("ESP32 Status:");
  display.print("WiFi: ");
  display.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  display.print("WS: ");
  display.println(isStompConnected ? "Connected" : "Disconnected");
  display.print("MAC: ");
  display.println(WiFi.macAddress());
  display.print("IP: ");
  display.println(WiFi.localIP());
  display.display();
}

// ---------------- Loop ----------------
void loop() {
  webSocket.loop();
  displayStatus();

  static unsigned long lastSend = 0;
  if (isStompConnected && millis() - lastSend > 5000) {
    lastSend = millis();

    StaticJsonDocument<400> json;
    
    json["temp"] = random(20, 30);
    json["humidity"] = random(30, 80);
    json["pression"] = random(1000, 1020);
    json["co2"] = random(400, 600);
    json["gas"] = random(30, 70);
    json["uv"] = random(1, 11);
    json["lumiere"] = random(5000, 12000);
    json["timestamp"] = getISO8601Time();
    json["mac"] = WiFi.macAddress();

    String payloadJson;
    serializeJson(json, payloadJson);

    String sendFrame = "SEND\n";
    sendFrame += "destination:/app/addData\n";
    sendFrame += "content-type:application/json\n";
    sendFrame += "content-length:" + String(payloadJson.length()) + "\n";
    sendFrame += "\n";
    sendFrame += payloadJson;

    sendStompFrame(sendFrame);
    Serial.println("Sent JSON data with real timestamp to Spring Boot!");
  }
}
