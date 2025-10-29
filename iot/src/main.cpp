#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include <AsyncTCP.h>
#include <WebSocketsClient.h>


// ----- Wi-Fi -----
const char* ssid = "Youcode";
const char* password = "Youcode@2024";

// ----- WebSocket Server -----
const char* ws_server = "192.168.8.121";
const uint16_t ws_port = 8080;
const char* ws_path = "/ws-native";

WebSocketsClient webSocket;

// ----- OLED -----
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

bool isStompConnected = false;


void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected.");
      isStompConnected = false;
      break;
      
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected!");
      Serial.println("Sending STOMP CONNECT frame...");
      webSocket.sendTXT("CONNECT\naccept-version:1.2\nhost:" + String(ws_server) + "\n\n\0");
      break;
      
    case WStype_TEXT:
      Serial.printf("Received: %s\n", payload);
      if (strstr((char*)payload, "CONNECTED")) {
        Serial.println("STOMP Connection Successful!");
        isStompConnected = true;
      }
      break;
      
    case WStype_BIN:
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("Connecting to WiFi...");
  display.display();

  // Connect Wi-Fi
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  // Connect WebSocket
  webSocket.begin(ws_server, ws_port, ws_path);
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  int mq135Value = random(200, 800);
  float tempC = random(20, 35);
  float humidity = random(30, 80);

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  
  if (isStompConnected) {
    display.println("STOMP Connected!");
  } else {
    display.println("Connecting STOMP...");
  }
  
  display.print("IP: ");
  display.println(WiFi.localIP());
  display.setCursor(0,20);
  display.print("MQ135: "); display.println(mq135Value);
  display.setCursor(0,35);
  display.print("Temp: "); display.print(tempC); display.println(" C");
  display.setCursor(0,50);
  display.print("Humidity: "); display.print(humidity); display.println(" %");
  display.display();

  if (isStompConnected) {
    
    StaticJsonDocument<200> doc;
    doc["temp"] = tempC;
    doc["humidity"] = humidity;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    String stompMessage = "SEND\n";
    stompMessage += "destination:/app/addData\n";
    stompMessage += "content-type:application/json\n";
    stompMessage += "content-length:" + String(jsonPayload.length()) + "\n";
    stompMessage += "\n";
    stompMessage += jsonPayload;
    
    webSocket.sendTXT(stompMessage + "\0");
    
    Serial.println("Sent STOMP message: ");
    Serial.println(stompMessage);
    
  } else {
    Serial.println("STOMP not connected, waiting...");
  }

  delay(1000);
}