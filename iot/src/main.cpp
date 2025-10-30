#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char* ssid = "Youcode";
const char* password = "Youcode@2024";

const char* ws_server = "192.168.9.70";
const int ws_port = 8080;
const char* ws_path = "/ws-native";

WebSocketsClient webSocket;
bool isStompConnected = false;

void sendStompFrame(String frame) {
  frame += '\0';
  webSocket.sendTXT(frame);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println(" WebSocket Disconnected.");
      isStompConnected = false;
      break;

    case WStype_CONNECTED:
      Serial.println(" WebSocket Connected!");
      {
        String connectFrame = "CONNECT\n";
        connectFrame += "accept-version:1.2\n";
        connectFrame += "host:" + String(ws_server) + "\n";
        connectFrame += "\n";
        sendStompFrame(connectFrame);
      }
      break;

    case WStype_TEXT:
      Serial.print(" Received: ");
      Serial.println((char*)payload);

      if (String((char*)payload).startsWith("CONNECTED")) {
        Serial.println(" STOMP Connection Successful!");
        isStompConnected = true;

        String subscribeFrame = "SUBSCRIBE\n";
        subscribeFrame += "id:sub-0\n";
        subscribeFrame += "destination:/topic/data\n";
        subscribeFrame += "\n";
        sendStompFrame(subscribeFrame);
      }
      break;

    case WStype_ERROR:
      Serial.println(" WebSocket Error!");
      isStompConnected = false;
      break;

    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print(" Connected! IP Address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin(ws_server, ws_port, ws_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();

  static unsigned long lastSend = 0;
  if (isStompConnected && millis() - lastSend > 5000) {
    lastSend = millis();

    StaticJsonDocument<200> json;
    json["device"] = "ESP32";
    json["temp"] = random(20, 30);
    json["humidity"] = random(30, 80);

    String payloadJson;
    serializeJson(json, payloadJson);

    String sendFrame = "SEND\n";
    sendFrame += "destination:/app/addData\n";
    sendFrame += "content-type:application/json\n";
    sendFrame += "content-length:" + String(payloadJson.length()) + "\n";
    sendFrame += "\n";
    sendFrame += payloadJson;

    sendStompFrame(sendFrame);
    Serial.println(" Sent JSON data to Spring Boot!");
  }
}