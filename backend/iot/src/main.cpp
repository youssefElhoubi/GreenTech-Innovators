#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "time.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BME280.h>
#include "config.h"
#include "oledDetector.h"

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// === DEFINITION DES PINS POUR LES CAPTEURS ===
#define MQ6_PIN 35          // GPIO 35 (D35 / A7) pour MQ-6 A0 (sortie analogique)
#define GYML8511_PIN 32     // GPIO 32 (D32 / A4) pour GYML8511 (UV)

// === CREATION DES OBJETS CAPTEURS ===
Adafruit_BME280 bme;

const char* ssid = "Youcode";
const char* password = "Youcode@2024";

const char* ws_server = "192.168.9.66";
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

// === FONCTION POUR LIRE LE CAPTEUR GYML8511/ML8511 (UV) ===
float readUV() {
  // Moyenne de plusieurs lectures pour stabilité
  int sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(GYML8511_PIN);
    delay(2);
  }
  int rawValue = sum / 10;
  
  // Conversion en volts
  float voltage = (rawValue / 4095.0) * 3.3;
  
  // ML8511 Calibration Alternative
  // Option 1: Mapping linéaire de voltage vers UV index (0-15)
  // float uvIndex = (voltage / 2.9) * 15.0;
  
  // Option 2: Retourner voltage multiplié par 10 pour avoir des valeurs entre 0-33
  float uvIndex = voltage * 10.0;
  
  // Option 3: Retourner voltage directement (0.0 - 3.3)
  // float uvIndex = voltage;

  // DEBUG: Afficher les valeurs brutes
  static unsigned long lastDebug = 0;
  if (millis() - lastDebug > 2000) {
    lastDebug = millis();
    Serial.print("[UV DEBUG] Raw: ");
    Serial.print(rawValue);
    Serial.print(" | Voltage: ");
    Serial.print(voltage, 3);
    Serial.print("V | UV Index: ");
    Serial.print(uvIndex, 2);
    Serial.println();
  }

  // Limiter les valeurs entre 0 et 15
  if (uvIndex < 0) uvIndex = 0;
  if (uvIndex > 15) uvIndex = 15;
  
  return uvIndex;
}

// Variable globale pour stocker la dernière lecture MQ-6
int lastMQ6Reading = 0;

// === FONCTION POUR LIRE LE CAPTEUR MQ-6 (GAZ LPG/BUTANE) AVEC LISSAGE ===
int readMQ6_Raw() {
  // Moyenne de 20 lectures pour un meilleur lissage
  int sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(MQ6_PIN);
    delay(5);
  }
  int rawValue = sum / 20;

  // Stocker pour réutilisation
  lastMQ6Reading = rawValue;

  // DEBUG
  static unsigned long lastDebugMQ = 0;
  if (millis() - lastDebugMQ > 2000) {
    lastDebugMQ = millis();
    Serial.print("[MQ6 DEBUG] Raw (moyenne): ");
    Serial.print(rawValue);
    Serial.print(" | Voltage: ");
    float voltage = (rawValue / 4095.0) * 3.3;
    Serial.print(voltage, 3);
    Serial.print("V | Gaz: ");
    float gas_ppm = map(rawValue, 100, 1000, 200, 5000);
    Serial.print(gas_ppm);
    Serial.println(" ppm");
  }

  return rawValue;
}

float readMQ6_CO2() {
  // Utilise la dernière lecture stockée
  int rawValue = lastMQ6Reading;

  // Conversion en ppm de gaz LPG
  float gas_ppm = map(rawValue, 100, 1000, 200, 5000);
  if (gas_ppm < 200) gas_ppm = 200;
  if (gas_ppm > 10000) gas_ppm = 10000;
  return gas_ppm;
}

float readMQ6_Gas() {
  // Utilise la dernière lecture stockée
  int rawValue = lastMQ6Reading;

  // Qualité d'air basée sur la concentration de gaz
  float gas_quality = map(rawValue, 100, 1000, 0, 100);
  if (gas_quality < 0) gas_quality = 0;
  if (gas_quality > 100) gas_quality = 100;
  return gas_quality;
}

// ---------------- Setup ----------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  // === INITIALISATION DES PINS ===
  pinMode(GYML8511_PIN, INPUT);        // GYML8511 = analogique
  pinMode(MQ6_PIN, INPUT);             // MQ-6 A0 = analogique
  analogSetAttenuation(ADC_11db);      // Pour lectures analogiques (GYML8511 + MQ-6)

  // === INITIALISATION DE L'ÉCRAN OLED AVEC AUTO-DÉTECTION ===
  // NOUVEAU: Auto-détection des pins I2C et de l'adresse de l'écran
  if (!initOLED(display)) {
    Serial.println("[ERREUR] Impossible d'initialiser l'écran OLED");
    Serial.println("[INFO] Continuons quand même sans écran...");
  } else {
    Serial.println("[OK] Écran OLED initialisé avec succès!");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
  }

  // === INITIALISATION DU BUS I2C ===
  Wire.setClock(100000);
  Serial.println("[INFO] Bus I2C sur D21/D22 à 100kHz");

  // === INITIALISATION DU CAPTEUR BME280 ===
  Serial.println("[TEST] Tentative d'initialisation du BME280...");
  if (!bme.begin(0x76)) {
    Serial.println("[ERREUR] BME280 non détecté à l'adresse 0x76!");
    Serial.println("[INFO] Essai à l'adresse 0x77...");
    if (!bme.begin(0x77)) {
      Serial.println("[ERREUR] BME280 non détecté à l'adresse 0x77!");
      Serial.println("[INFO] Vérifiez le câblage:");
      Serial.println("  - BME280 VIN  -> ESP32 3V3");
      Serial.println("  - BME280 GND  -> ESP32 GND");
      Serial.println("  - BME280 SDA  -> ESP32 D21 (GPIO 21)");
      Serial.println("  - BME280 SCL  -> ESP32 D22 (GPIO 22)");
    } else {
      Serial.println("[OK] BME280 initialisé à l'adresse 0x77!");
    }
  } else {
    Serial.println("[OK] BME280 initialisé à l'adresse 0x76!");
  }

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
// Affichage IP + MAC + Valeurs capteurs
void displayStatus(float temp, float hum, float press, float co2, float gas, float uv) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);

  // Ligne 1: IP
  display.print("IP:");
  display.println(WiFi.localIP());

  // Ligne 2: MAC
  display.print("MAC:");
  display.println(WiFi.macAddress());

  // Ligne 3: Température et Humidité
  display.print("T:");
  display.print(temp, 1);
  display.print("C H:");
  display.print(hum, 0);
  display.println("%");

  // Ligne 4: Pression
  display.print("P:");
  display.print(press, 0);
  display.println("hPa");

  // Ligne 5: CO2
  display.print("CO2:");
  display.print(co2, 0);
  display.println("ppm");

  // Ligne 6: Gaz et UV (tension brute)
  display.print("Gaz:");
  display.print(gas, 0);
  display.print("% UV:");
  int uvRaw = analogRead(GYML8511_PIN);
  float uvVolt = (uvRaw / 4095.0) * 3.3;
  display.print(uvVolt, 2);
  display.println("V");

  display.display();
}

// ---------------- Loop ----------------
void loop() {
  webSocket.loop();

  // === LECTURE DES CAPTEURS ACTIFS ===

  // Lecture BME280 (Température, Humidité et Pression)
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0;

  // Lecture GYML8511 (UV)
  float uv = readUV();

  // Lecture MQ-6 (Gaz LPG)
  readMQ6_Raw();
  float co2 = readMQ6_CO2();
  float gas = readMQ6_Gas();

  // Afficher sur l'écran OLED
  displayStatus(temperature, humidity, pressure, co2, gas, uv);

  static unsigned long lastSend = 0;
  if (isStompConnected && millis() - lastSend > 1000) {
    lastSend = millis();

    StaticJsonDocument<512> json;
    
    json["temp"] = (double)temperature;
    json["humidity"] = (float)humidity;
    json["pression"] = (int)pressure;
    json["co2"] = (int)co2;
    json["gas"] = (int)gas;
    json["uv"] = (double)uv;
    json["lumiere"] = 0;
    json["timestamp"] = getISO8601Time();
    json["mac"] = WiFi.macAddress();

    String payloadJson;
    serializeJson(json, payloadJson);

    // Debug: afficher le JSON complet
    Serial.print("[SEND DEBUG] UV value: ");
    Serial.print(uv, 2);
    Serial.print(" | JSON: ");
    Serial.println(payloadJson);

    String sendFrame = "SEND\n";
    sendFrame += "destination:/app/addData\n";
    sendFrame += "content-type:application/json\n";
    sendFrame += "content-length:" + String(payloadJson.length()) + "\n";
    sendFrame += "\n";
    sendFrame += payloadJson;

    sendStompFrame(sendFrame);
    Serial.println("✓ Sent JSON data with real timestamp to Spring Boot!");
  }
}
