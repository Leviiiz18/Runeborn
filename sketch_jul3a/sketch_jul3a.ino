#include <Wire.h>

#define MPU6050_ADDR 0x68

void setup() {
  Serial.begin(115200);
  // ESP32 I2C pins for GY-521
  Wire.begin(21, 22);

  // Wake up MPU6050
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x6B); // Power management register
  Wire.write(0x00); // Wake up
  Wire.endTransmission();

  delay(100);
  Serial.println("ESP32 MPU6050 Game Controller Ready");
}

void loop() {
  // Read all 14 bytes starting at ACCEL_XOUT_H (0x3B)
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 14);

  if (Wire.available() == 14) {
    // Read Accelerometer (Tilt)
    int16_t ax = (Wire.read() << 8) | Wire.read();
    int16_t ay = (Wire.read() << 8) | Wire.read();
    int16_t az = (Wire.read() << 8) | Wire.read();

    // Skip Temperature
    Wire.read(); Wire.read();

    // Read Gyroscope (Twist/Shake)
    int16_t gx = (Wire.read() << 8) | Wire.read();
    int16_t gy = (Wire.read() << 8) | Wire.read();
    int16_t gz = (Wire.read() << 8) | Wire.read();

    // --- GAME LOGIC ---
    // We use Accelerometer for holding a tilt (running left/right)
    // We use Gyroscope for sudden movements (jumping/attacking)

    String direction = "STILL";

    // 1. Check for Attack (Twisting the controller fast on Z axis)
    if (gz > 15000 || gz < -15000) {
      direction = "CLOCKWISE"; // This triggers attack in our web game
    }
    // 2. Check for Jump (Flicking the controller up fast)
    else if (gy > 15000 || gy < -15000) {
      direction = "UP"; // This triggers jump
    }
    // 3. Check for Movement (Tilting the controller left or right)
    // Increased the deadzone from 4000 to 7000 (roughly a 30-degree tilt)
    // to prevent it from constantly moving if held slightly tilted or uncalibrated.
    
    // NOTE: If Left and Right are swapped for you, change 'ax > 7000' to 'ax < -7000' and vice versa.
    // If tilting forward/backward is moving you left/right, change 'ax' to 'ay'.
    else if (ax > 7000) {
      direction = "RIGHT";
    }
    else if (ax < -7000) {
      direction = "LEFT";
    }

    // Send the data to the Web API
    Serial.print("AX: "); Serial.print(ax);
    Serial.print("  GZ: "); Serial.print(gz);
    Serial.print("  -> ");
    Serial.println(direction);
  }

  delay(50); // 20 updates per second is smooth for the web game
}