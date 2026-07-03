#include <Wire.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <MPU9250_asukiaaa.h>

// ---------------------------------------------------------
// Configuration
// ---------------------------------------------------------
const char* ssid = "CSD";
const char* password = "csd@NITK2014";

const char* ws_host = "10.100.82.44"; 
const uint16_t ws_port = 8080;

// Buttons
const int TRIGGER_PIN = 4; // Physical button for Rune Drawing

MPU9250_asukiaaa mpu;
WebSocketsClient webSocket;

// State tracking
bool isTriggerPressed = false;
unsigned long lastFlickTime = 0;
const int FLICK_COOLDOWN = 500; // ms

void setup() {
  Serial.begin(115200);
  pinMode(TRIGGER_PIN, INPUT_PULLUP);

  Wire.begin(8, 9);
  mpu.setWire(&Wire);

  mpu.beginAccel();
  mpu.beginGyro();
  Serial.println("MPU Started");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");

  webSocket.begin(ws_host, ws_port, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();

  mpu.accelUpdate();
  mpu.gyroUpdate();

  float ax = mpu.accelX();
  float ay = mpu.accelY();
  float az = mpu.accelZ();
  float gx = mpu.gyroX();
  float gy = mpu.gyroY();
  float gz = mpu.gyroZ();

  // Read Trigger Button
  bool currentTrigger = digitalRead(TRIGGER_PIN) == LOW;

  if (currentTrigger != isTriggerPressed) {
    isTriggerPressed = currentTrigger;
    if (isTriggerPressed) sendAction("TRIGGER_PRESS");
    else sendAction("TRIGGER_RELEASE");
  }

  unsigned long currentTime = millis();
  
  if (currentTime - lastFlickTime > FLICK_COOLDOWN) {
    if (az > 1.5) {
      sendAction("FLICK_UP");
      lastFlickTime = currentTime;
    } else if (ay > 1.5) {
      sendAction("THRUST_FORWARD");
      lastFlickTime = currentTime;
    } else if (abs(ax) > 1.5) {
      sendAction("FLICK_HORIZONTAL");
      lastFlickTime = currentTime;
    }
  }

  static unsigned long lastUpdate = 0;
  if (currentTime - lastUpdate > 50) { 
    String payload = "{\"type\":\"motion\", \"ax\":" + String(ax) + 
                     ", \"ay\":" + String(ay) + 
                     ", \"az\":" + String(az) + 
                     ", \"gx\":" + String(gx) + 
                     ", \"gy\":" + String(gy) + 
                     ", \"gz\":" + String(gz) + "}";
    webSocket.sendTXT(payload);
    
    // --- Web Serial API Support for Runeborn Game ---
    String direction = "";
    
    // 1. Block / Defend (Trigger Button)
    if (digitalRead(TRIGGER_PIN) == LOW) {
      direction += "DOWN,";
    }

    // 2. Movement (Accelerometer)
    // Tilt Left / Right
    if (ax > 0.4) direction += "RIGHT,";
    else if (ax < -0.4) direction += "LEFT,";

    // 3. Attacks & Combos (Gyro Flicks)
    static int comboStep = 0;
    static unsigned long lastTwistTime = 0;
    static bool isTwisting = false;
    static int totalAttacks = 0; // Charge meter for Ultimate

    // Reset combo if more than 1.5 seconds have passed since the last twist
    if (currentTime - lastTwistTime > 1500) {
      comboStep = 0;
    }

    if (gz > 250) {
      if (!isTwisting) {
        isTwisting = true;
        comboStep++;
        totalAttacks++; // Charge the ultimate!
        lastTwistTime = currentTime;
      }
      
      // Output the attack based on the current combo step
      if (comboStep == 1 || comboStep == 2) {
        direction += "ATK1,";
      } else if (comboStep == 3) {
        direction += "ATK2,";
      } else if (comboStep >= 4) {
        direction += "ATK3,";
        if (comboStep >= 4) comboStep = 0; // Reset after a full combo
      }
    } 
    else {
      // If they twist counter-clockwise, shortcut to ATK2
      if (gz < -250) {
        if (!isTwisting) {
           isTwisting = true;
           totalAttacks++;
        }
        direction += "ATK2,";
      }
      // Flick Pitch UP (Jump)
      else if (gy > 250) {
        direction += "UP,";
      }
      // Flick Pitch DOWN (Special Attack - Requires 13 Charges)
      else if (gy < -250) {
        if (totalAttacks >= 13) {
          direction += "SPECIAL,";
          totalAttacks = 0; // Reset charges after using ultimate!
        }
      }
      
      // When gyro drops below 200, we consider the twist "finished" and ready for the next flick
      if (abs(gz) < 200 && abs(gy) < 200) {
        isTwisting = false;
      }
    }

    if (direction == "") {
      direction = "STILL";
    }

    Serial.print("AX: "); Serial.print(ax);
    Serial.print("  GZ: "); Serial.print(gz);
    Serial.print("  -> ");
    Serial.println(direction);

    lastUpdate = currentTime;
  }
}

void sendAction(String action) {
  String payload = "{\"type\":\"action\", \"value\":\"" + action + "\"}";
  webSocket.sendTXT(payload);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {}
