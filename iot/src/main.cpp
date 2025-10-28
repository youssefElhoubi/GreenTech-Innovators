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
const char* ws_server = "192.168.1.100";
const uint16_t ws_port = 8080;
const char* ws_path = "/ws";

WebSocketsClient webSocket;


#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);


void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  if(type == WStype_TEXT){
    Serial.printf("Received: %s\n", payload);
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

  display.clearDisplay();
  display.setCursor(0,0);
  display.println("WiFi connected!");
  display.print("IP: ");
  display.println(WiFi.localIP());
  display.display();

  // Connect WebSocket
  webSocket.begin(ws_server, ws_port, ws_path);
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  // --- Fake sensor values ---
  int mq135Value = random(200, 800);
  float tempC = random(20, 35);
  float humidity = random(30, 80);

  // --- Display on OLED ---
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("WiFi connected!");
  display.print("IP: ");
  display.println(WiFi.localIP());
  display.setCursor(0,20);
  display.print("MQ135: "); display.println(mq135Value);
  display.setCursor(0,35);
  display.print("Temp: "); display.print(tempC); display.println(" C");
  display.setCursor(0,50);
  display.print("Humidity: "); display.print(humidity); display.println(" %");
  display.display();


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

  delay(5000);
}