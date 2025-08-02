Here is the simplified, bilingual tutorial for building your Ninja Robot.

## Part 1: English Version Tutorial

This tutorial provides a step-by-step guide to building the Ninja Robot, from hardware assembly to running the AI-powered web interface.

### **Step 1: Hardware and OS Setup**

#### **1.1 Prepare the Raspberry Pi Operating System**

We will perform a "headless" setup, configuring the Raspberry Pi without a monitor or keyboard.

1.  **Download Raspberry Pi Imager** from the official Raspberry Pi website.
2.  **Insert your microSD card** into your computer and launch the Imager.
3.  **Configure the OS:**
      * **Device:** Raspberry Pi Zero 2 W
      * **Operating System:** Raspberry Pi OS (Legacy, 64-bit). A "Lite" version is recommended.
      * **Storage:** Select your microSD card.
4.  **Pre-configure Settings:** Click "Next" -\> "Edit Settings".
      * **General Tab:** Set a hostname (e.g., `ninjapi`), a username, and a password.
      * **Enable WiFi:** Check "Configure wireless LAN" and enter the credentials for your **2.4GHz WiFi network**. The Pi Zero 2W does not support 5GHz networks.[1]
      * **Services Tab:** Check "Enable SSH" and select "Use password authentication".
5.  **Write the Image:** Click "Save", then "Yes" to write the OS to the microSD card.
6.  **First Boot:** Insert the microSD card into the Pi, connect power, and wait a few minutes.
7.  **Connect via SSH:** From another computer on the same network, open a terminal and connect:
    ```bash
    ssh your_username@ninjapi.local
    ```

#### **1.2 Assemble and Wire the Robot**

Connect all components to the DFRobot IO Expansion HAT according to the table below.

**CRITICAL:** The HC-SR04 sensor's ECHO pin outputs a 5V signal, but the Raspberry Pi's GPIO pins are only 3.3V tolerant. You **must** use a voltage divider (1 kΩ and 2 kΩ resistors) to prevent damage to your Pi.[2, 3]

| Component | Wire Color | Connection on DFRobot HAT | Notes |
| :--- | :--- | :--- | :--- |
| **Pan Servo** | Orange (Signal) | PWM Port 0, 'S' pin | For side-to-side movement |
| | Red (VCC) | PWM Port 0, '⊕' pin | **Connect to external 6-12V power** |
| | Brown (GND) | PWM Port 0, '㊀' pin | External Power Ground |
| **Tilt Servo** | Orange (Signal) | PWM Port 1, 'S' pin | For up-down movement |
| | Red (VCC) | PWM Port 1, '⊕' pin | **Connect to external 6-12V power** |
| | Brown (GND) | PWM Port 1, '㊀' pin | External Power Ground |
| **HC-SR04 Sensor** | VCC | 5V (from Pi) | |
| | Trig | Digital Port 17, 'S' pin | |
| | Echo | **To Voltage Divider Input** | **MANDATORY to protect Pi** |
| | GND | GND | |
| **Waveshare LCD** | VCC | 3.3V | |
| | GND | GND | |
| | DIN (MOSI) | SPI Port, 'MOSI' pin | |
| | CLK (SCLK) | SPI Port, 'SCLK' pin | |
| | CS | SPI Port, 'SS' (CE0) pin | |
| | DC | Digital Port 25, 'S' pin | |
| | RST | Digital Port 24, 'S' pin | |
| | BL | Digital Port 23, 'S' pin | |
| **Active Buzzer** | Positive (+) | Digital Port 16, 'S' pin | |
| | Negative (-) | GND | |

### **Step 2: Software Installation**

#### **2.1 Set Up the Project Environment**

Connect to your Pi via SSH and run these commands.

1.  **Create Project Directory:**
    ```bash
    mkdir ~/ninja_robot && cd ~/ninja_robot
    ```
2.  **Create Python Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Create Directory Structure:**
    ```bash
    mkdir -p controllers services static/css static/js templates
    touch app.py calibration.py config.json requirements.txt
    touch controllers/__init__.py controllers/servo_controller.py controllers/sensor_controller.py controllers/display_controller.py controllers/sound_controller.py
    touch services/__init__.py services/gemini_agent.py
    touch static/css/style.css static/js/main.js
    touch templates/index.html
    ```

#### **2.2 Install Required Libraries**

1.  **Install Python Packages:** Add the following to `requirements.txt`, then run `pip install -r requirements.txt`.
    ```
    Flask
    google-generativeai
    pyserial
    RPi.GPIO
    spidev
    Pillow
    gpiozero
    ```
2.  **Install DFRobot HAT Library:** This library is needed to control the servos.
    ```bash
    git clone https://github.com/DFRobot/DFRobot_RaspberryPi_Expansion_Board.git
    # Copy the inner library folder into your project
    cp -r DFRobot_RaspberryPi_Expansion_Board/raspberry/DFRobot_RaspberryPi_Expansion_Board.
    ```
3.  **Install Waveshare LCD Library:** This is needed for the display.
    ```bash
    wget https://files.waveshare.com/upload/8/8d/LCD_Module_RPI_code.zip
    unzip LCD_Module_RPI_code.zip
    # Copy the library into your project
    cp -r LCD_Module_RPI_code/RaspberryPi/python/lib.
    ```

#### **2.3 Configure the Gemini AI Agent**

1.  **Get a Gemini API Key:**
      * Go to **Google AI Studio**.[4, 5]
      * Click "Get API key" and then "Create API key".
      * Copy the generated key and keep it safe.
2.  **Securely Store the API Key:** Do not put the key directly in your code. Store it as an environment variable.
      * Open the `.bashrc` file: `nano ~/.bashrc`
      * Add this line to the end, replacing `YOUR_API_KEY` with your actual key [6]:
        ```bash
        export GEMINI_API_KEY='YOUR_API_KEY'
        ```
      * Save (Ctrl+O) and exit (Ctrl+X). Apply the change: `source ~/.bashrc`

### **Step 3: The Code**

Copy and paste the following code blocks into their respective files on your Raspberry Pi.

#### **`config.json`**

This file stores hardware pin configurations.

```json
{
    "servos": {
        "pan": {
            "channel": 0,
            "min_angle": -90,
            "max_angle": 90
        },
        "tilt": {
            "channel": 1,
            "min_angle": -45,
            "max_angle": 45
        },
        "drive_left": {
            "channel": 2
        },
        "drive_right": {
            "channel": 3
        }
    },
    "sensors": {
        "distance_trigger_pin": 17,
        "distance_echo_pin": 27
    },
    "display": {
        "rst_pin": 24,
        "dc_pin": 25,
        "bl_pin": 23
    },
    "sound": {
        "buzzer_pin": 16
    }
}
```

#### **`calibration.py`**

This script helps you find the correct center position for your servos.

```python
# calibration.py
# Run this script to set all servos to their 0-degree position before final assembly.
import time
from DFRobot_RaspberryPi_Expansion_Board import DFRobot_Expansion_Board_Servo as Servo

# Initialize the servo controller from the DFRobot library
servo_board = Servo.DFRobot_Expansion_Board_Servo(bus_id=1, addr=0x10)
servo_board.begin()

def calibrate():
    """Interactive servo calibration routine."""
    print("--- Servo Calibration ---")
    print("This script will move servos to their 0-degree (center) position.")
    print("Attach servo arms/horns while the script is running to ensure correct alignment.")
    
    while True:
        try:
            channel_str = input("Enter servo channel to test (0-3), or 'q' to quit: ").strip()
            if channel_str.lower() == 'q':
                break
            
            channel = int(channel_str)
            if not 0 <= channel <= 3:
                print("Invalid channel. Must be 0-3.")
                continue

            # The DFRobot library's move function takes an angle from 0-180.
            # 90 degrees is the center position.
            center_angle = 90
            print(f"Moving servo on channel {channel} to center position (90 degrees)...")
            servo_board.move(channel, center_angle)
            print("Servo is now at its center. Attach the horn pointing straight.")

        except ValueError:
            print("Invalid input. Please enter a number.")
        except Exception as e:
            print(f"An error occurred: {e}")

    print("Calibration finished.")

if __name__ == "__main__":
    calibrate()
```

#### **`controllers/servo_controller.py`**

```python
# controllers/servo_controller.py
import json
from DFRobot_RaspberryPi_Expansion_Board import DFRobot_Expansion_Board_Servo as Servo
import time

class ServoController:
    def __init__(self, config_path='config.json'):
        with open(config_path, 'r') as f:
            self.config = json.load(f)['servos']
        
        self.board = Servo.DFRobot_Expansion_Board_Servo(bus_id=1, addr=0x10)
        self.board.begin()
        self.current_angles = {name: 0 for name in self.config.keys()}
        self.center_all()

    def _map_angle(self, servo_name, angle):
        servo_info = self.config.get(servo_name, {})
        min_angle = servo_info.get('min_angle', -90)
        max_angle = servo_info.get('max_angle', 90)
        angle = max(min(angle, max_angle), min_angle)
        # Map angle from min/max range to DFRobot's 0-180 range
        return int((angle - min_angle) * (180.0 / (max_angle - min_angle)))

    def set_angle(self, servo_name, angle):
        servo_info = self.config.get(servo_name)
        if not servo_info:
            print(f"Error: Servo '{servo_name}' not in config.")
            return
        channel = servo_info['channel']
        dfrobot_angle = self._map_angle(servo_name, angle)
        self.board.move(channel, dfrobot_angle)
        self.current_angles[servo_name] = angle

    def get_current_angle(self, servo_name):
        return self.current_angles.get(servo_name, 0)

    def center_all(self):
        for name in ['pan', 'tilt']:
            if name in self.config:
                self.set_angle(name, 0)
        self.stop()
        time.sleep(0.5)

    def move_forward(self):
        self.set_angle('drive_left', 90)
        self.set_angle('drive_right', -90)

    def move_backward(self):
        self.set_angle('drive_left', -90)
        self.set_angle('drive_right', 90)

    def turn_left(self):
        self.set_angle('drive_left', -90)
        self.set_angle('drive_right', -90)

    def turn_right(self):
        self.set_angle('drive_left', 90)
        self.set_angle('drive_right', 90)

    def stop(self):
        self.set_angle('drive_left', 0)
        self.set_angle('drive_right', 0)
```

#### **`controllers/sensor_controller.py`**

```python
# controllers/sensor_controller.py
from gpiozero import DistanceSensor
import time

class SensorController:
    def __init__(self, config):
        trigger_pin = config['sensors']['distance_trigger_pin']
        echo_pin = config['sensors']['distance_echo_pin']
        self.distance_sensor = DistanceSensor(echo=echo_pin, trigger=trigger_pin)

    def get_distance(self):
        try:
            # gpiozero returns distance in meters, convert to cm
            return self.distance_sensor.distance * 100
        except Exception as e:
            print(f"Error reading distance sensor: {e}")
            return -1.0
```

#### **`controllers/sound_controller.py`**

```python
# controllers/sound_controller.py
from gpiozero import TonalBuzzer
from gpiozero.tones import Tone
import time

class SoundController:
    def __init__(self, config):
        buzzer_pin = config['sound']['buzzer_pin']
        self.buzzer = TonalBuzzer(buzzer_pin)

    def play_tone(self, note, duration=0.1):
        try:
            self.buzzer.play(Tone(note))
            time.sleep(duration)
            self.buzzer.stop()
        except Exception as e:
            print(f"Buzzer error: {e}")

    def play_confirmation(self):
        self.play_tone("C5")
        self.play_tone("G5")

    def play_error(self):
        self.play_tone("G4")
        self.play_tone("C4")
```

#### **`controllers/display_controller.py`**

```python
# controllers/display_controller.py
from lib import LCD_2inch
from PIL import Image, ImageDraw, ImageFont
import time

class DisplayController:
    def __init__(self, config):
        disp_config = config['display']
        self.disp = LCD_2inch.LCD_2inch()
        self.disp.Init()
        self.disp.clear()
        self.image = Image.new("RGB", (self.disp.width, self.disp.height), "BLACK")
        self.draw = ImageDraw.Draw(self.image)
        try:
            self.font_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            self.font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        except IOError:
            self.font_big = ImageFont.load_default()
            self.font_small = ImageFont.load_default()
        self.show_message("Ninja-Pi", "Booting...")

    def show_message(self, line1, line2="", line3=""):
        self.draw.rectangle((0, 0, self.disp.width, self.disp.height), fill="BLACK")
        self.draw.text((10, 5), line1, font=self.font_big, fill="WHITE")
        self.draw.text((10, 35), line2, font=self.font_small, fill="CYAN")
        self.draw.text((10, 55), line3, font=self.font_small, fill="CYAN")
        self.disp.ShowImage(self.image)
```

#### **`services/gemini_agent.py`**

```python
# services/gemini_agent.py
import os
import google.generativeai as genai

class GeminiAgent:
    def __init__(self):
        self.status = "Initializing..."
        try:
            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEY not set.")
            
            genai.configure(api_key=api_key)
            
            system_instruction = (
                "You are Ninja-Pi, a robot assistant. Your answers must be concise. "
                "Based on the user's command, you must decide on one action and embed it in your response "
                "in the format:. Available actions: move_forward, move_backward, "
                "turn_left, turn_right, stop, scan_area, report_status, happy_sound, sad_sound."
            )
            self.model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
            self.status = "Ready"
        except Exception as e:
            self.status = f"Error: {e}"
            print(f"Gemini Agent Init Error: {self.status}")

    def get_status(self):
        return self.status

    def ask(self, user_prompt, sensor_data={}):
        if "Error" in self.status:
            return "AI model is not available."
        
        context_prompt = f"Sensor data: Distance is {sensor_data.get('distance', 'N/A')} cm. User command: '{user_prompt}'"
        
        try:
            self.status = "Thinking..."
            response = self.model.generate_content(context_prompt)
            self.status = "Ready"
            return response.text
        except Exception as e:
            self.status = "Error"
            return f"AI Error: {e}"
```

#### **`app.py`**

This is the main web server application.

```python
# app.py
import json
import time
import threading
import socket
from flask import Flask, render_template, request, jsonify, Response

from controllers.servo_controller import ServoController
from controllers.sensor_controller import SensorController
from controllers.display_controller import DisplayController
from controllers.sound_controller import SoundController
from services.gemini_agent import GeminiAgent

app = Flask(__name__)

# --- Initialization ---
with open('config.json', 'r') as f:
    config = json.load(f)

servo_controller = ServoController(config_path='config.json')
sensor_controller = SensorController(config)
display_controller = DisplayController(config)
sound_controller = SoundController(config)
gemini_agent = GeminiAgent()

robot_state = {"distance": 0, "ai_response": "Awaiting command...", "last_command": "None"}

# --- Background Task ---
def update_sensors():
    global robot_state
    while True:
        dist = sensor_controller.get_distance()
        robot_state["distance"] = f"{dist:.1f}" if dist!= -1.0 else "Error"
        time.sleep(0.5)

threading.Thread(target=update_sensors, daemon=True).start()

# --- Command Execution ---
def parse_and_execute(ai_text):
    try:
        if "" in ai_text:
            start = ai_text.find("", start)
            command = ai_text[start:end].strip()
            
            robot_state["last_command"] = f"AI: {command}"
            sound_controller.play_confirmation()

            actions = {
                "move_forward": servo_controller.move_forward, "move_backward": servo_controller.move_backward,
                "turn_left": servo_controller.turn_left, "turn_right": servo_controller.turn_right,
                "stop": servo_controller.stop, "happy_sound": sound_controller.play_confirmation,
                "sad_sound": sound_controller.play_error,
                "scan_area": lambda: [servo_controller.set_angle('pan', a) or time.sleep(0.5) for a in [-45, 0, 45, 0]],
                "report_status": lambda: robot_state.update({"ai_response": f"Distance is {robot_state['distance']} cm."})
            }
            if command in actions:
                actions[command]()
    except Exception as e:
        print(f"Error executing AI command: {e}")
        sound_controller.play_error()

# --- Flask Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/command', methods=)
def command():
    action = request.get_json().get('action')
    robot_state["last_command"] = f"Web: {action}"
    
    actions = {
        'forward': servo_controller.move_forward, 'backward': servo_controller.move_backward,
        'left': servo_controller.turn_left, 'right': servo_controller.turn_right, 'stop': servo_controller.stop,
        'pan_left': lambda: servo_controller.set_angle('pan', servo_controller.get_current_angle('pan') + 15),
        'pan_right': lambda: servo_controller.set_angle('pan', servo_controller.get_current_angle('pan') - 15),
        'tilt_up': lambda: servo_controller.set_angle('tilt', servo_controller.get_current_angle('tilt') + 10),
        'tilt_down': lambda: servo_controller.set_angle('tilt', servo_controller.get_current_angle('tilt') - 10),
    }
    if action in actions:
        actions[action]()
        return jsonify(status="success")
    return jsonify(status="error", message="Unknown command"), 400

@app.route('/voice_command', methods=)
def voice_command():
    prompt = request.get_json().get('prompt')
    robot_state["last_command"] = f"Voice: {prompt}"
    ai_response = gemini_agent.ask(prompt, {"distance": robot_state["distance"]})
    robot_state["ai_response"] = ai_response
    parse_and_execute(ai_response)
    return jsonify(status="success", response=ai_response)

@app.route('/stream')
def stream():
    def event_stream():
        while True:
            data_to_send = {
                "distance": robot_state['distance'],
                "pan": servo_controller.get_current_angle('pan'),
                "tilt": servo_controller.get_current_angle('tilt'),
                "ai_status": gemini_agent.get_status(),
                "ai_response": robot_state["ai_response"],
                "last_command": robot_state["last_command"]
            }
            yield f"data: {json.dumps(data_to_send)}\n\n"
            time.sleep(0.5)
    return Response(event_stream(), mimetype="text/event-stream")

if __name__ == '__main__':
    # Get local IP to display
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()

    display_controller.show_message("Ninja-Pi Ready!", f"IP: {IP}")
    sound_controller.play_confirmation()
    app.run(host='0.0.0.0', port=80, debug=False)
```

#### **`templates/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ninja-Pi Command Center</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div class="container">
        <div class="controller">
            <div class="d-pad">
                <div id="btn-up" class="d-pad-btn">▲</div>
                <div id="btn-down" class="d-pad-btn">▼</div>
                <div id="btn-left" class="d-pad-btn">◄</div>
                <div id="btn-right" class="d-pad-btn">►</div>
            </div>
            <div class="center-panel">
                <div class="brand">NINJA-PI</div>
                <div id="voice-controls">
                    <button id="btn-voice-en">Speak (EN)</button>
                    <button id="btn-voice-ja">話す (JA)</button>
                    <button id="btn-voice-zh">说话 (ZH)</button>
                </div>
                <div id="voice-status">Status: Idle</div>
            </div>
            <div class="action-buttons">
                <div id="btn-triangle" class="action-btn">△</div>
                <div id="btn-circle" class="action-btn">○</div>
                <div id="btn-cross" class="action-btn">✕</div>
                <div id="btn-square" class="action-btn">□</div>
            </div>
        </div>
        <div class="interface-panels">
            <div class="panel ai-panel">
                <h2>AI Response</h2>
                <div id="ai-response-box" class="scroll-box">Awaiting...</div>
            </div>
            <div class="panel debug-panel">
                <h2>Debug Info</h2>
                <div id="debug-box">
                    <p>Distance: <span id="debug-distance">--</span> cm</p>
                    <p>Pan/Tilt: <span id="debug-pan">--</span>° / <span id="debug-tilt">--</span>°</p>
                    <p>AI Status: <span id="debug-ai-status">--</span></p>
                    <p>Last Cmd: <span id="debug-last-command">--</span></p>
                </div>
            </div>
        </div>
    </div>
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>
```

#### **`static/css/style.css`**

```css
body { background-color: #1a1a1d; color: #c5c6c7; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.container { width: 90%; max-width: 800px; display: flex; flex-direction: column; gap: 20px; }
.controller { background-color: #333; border-radius: 15px; padding: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 8px rgba(0,0,0,0.5); }
.d-pad,.action-buttons { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; width: 150px; height: 150px; }
.d-pad-btn,.action-btn { background-color: #4f545c; border: 2px solid #2a2d31; display: flex; justify-content: center; align-items: center; font-size: 24px; cursor: pointer; user-select: none; transition: background-color 0.1s; }
.d-pad-btn:active,.action-btn:active { background-color: #6b717a; }
#btn-up { grid-column: 2; grid-row: 1; }
#btn-down { grid-column: 2; grid-row: 3; }
#btn-left { grid-column: 1; grid-row: 2; }
#btn-right { grid-column: 3; grid-row: 2; }
#btn-triangle { grid-column: 2; grid-row: 1; color: #4CAF50; border-radius: 50%; }
#btn-circle { grid-column: 3; grid-row: 2; color: #F44336; border-radius: 50%; }
#btn-cross { grid-column: 2; grid-row: 3; color: #2196F3; border-radius: 50%; }
#btn-square { grid-column: 1; grid-row: 2; color: #f0f; border-radius: 50%; }
.center-panel { text-align: center; }
.brand { font-size: 2em; font-weight: bold; color: #61dafb; margin-bottom: 15px; }
#voice-controls button { background-color: #0d6efd; color: white; border: none; padding: 10px; margin: 5px; border-radius: 5px; cursor: pointer; }
#voice-controls button:hover { background-color: #0b5ed7; }
#voice-status { margin-top: 10px; color: #9fa3a7; min-height: 20px; }
.interface-panels { display: flex; gap: 20px; width: 100%; }
.panel { background-color: #2b2d31; border-radius: 8px; padding: 15px; flex: 1; }
.panel h2 { margin-top: 0; color: #61dafb; border-bottom: 1px solid #444; padding-bottom: 10px; }
.scroll-box { height: 100px; overflow-y: auto; background-color: #1a1a1d; padding: 10px; border-radius: 5px; }
#debug-box p { margin: 8px 0; }
```

#### **`static/js/main.js`**

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const sendCommand = (action) => {
        fetch('/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        }).catch(err => console.error('Command Error:', err));
    };

    // Movement controls
    const movementButtons = {
        'btn-up': 'forward', 'btn-down': 'backward',
        'btn-left': 'left', 'btn-right': 'right'
    };
    for (const [id, action] of Object.entries(movementButtons)) {
        const btn = document.getElementById(id);
        btn.addEventListener('mousedown', () => sendCommand(action));
        btn.addEventListener('mouseup', () => sendCommand('stop'));
        btn.addEventListener('mouseleave', () => sendCommand('stop'));
    }

    // Pan/tilt controls
    document.getElementById('btn-triangle').addEventListener('click', () => sendCommand('tilt_up'));
    document.getElementById('btn-square').addEventListener('click', () => sendCommand('pan_left'));
    document.getElementById('btn-circle').addEventListener('click', () => sendCommand('pan_right'));
    document.getElementById('btn-cross').addEventListener('click', () => sendCommand('tilt_down'));

    // Voice Recognition
    const SpeechRecognition = window.SpeechRecognition |

| window.webkitSpeechRecognition;
    const voiceStatus = document.getElementById('voice-status');
    const aiResponseBox = document.getElementById('ai-response-box');

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;

        const setupRecognition = (lang) => {
            recognition.lang = lang;
            recognition.start();
            voiceStatus.textContent = 'Listening...';
        };

        document.getElementById('btn-voice-en').addEventListener('click', () => setupRecognition('en-US'));
        document.getElementById('btn-voice-ja').addEventListener('click', () => setupRecognition('ja-JP'));
        document.getElementById('btn-voice-zh').addEventListener('click', () => setupRecognition('cmn-Hans-CN'));

        recognition.onresult = (event) => {
            const transcript = event.results.transcript;
            voiceStatus.textContent = `Heard: "${transcript}"`;
            aiResponseBox.innerHTML = '<p><i>Sending to AI...</i></p>';

            fetch('/voice_command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: transcript })
            })
           .then(response => response.json())
           .then(data => { aiResponseBox.innerHTML = `<p>${data.response}</p>`; })
           .catch(error => { aiResponseBox.innerHTML = '<p>AI Error.</p>'; });
        };
        recognition.onerror = (event) => { voiceStatus.textContent = `Error: ${event.error}`; };
        recognition.onend = () => { if (voiceStatus.textContent === 'Listening...') voiceStatus.textContent = 'Status: Idle'; };
    } else {
        voiceStatus.textContent = 'Speech Recognition not supported.';
    }

    // Server-Sent Events for Debug Panel
    const eventSource = new EventSource("/stream");
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        document.getElementById('debug-distance').textContent = data.distance;
        document.getElementById('debug-pan').textContent = data.pan;
        document.getElementById('debug-tilt').textContent = data.tilt;
        document.getElementById('debug-ai-status').textContent = data.ai_status;
        document.getElementById('debug-last-command').textContent = data.last_command;
        if (!aiResponseBox.innerHTML.includes('<i>')) {
            aiResponseBox.innerHTML = `<p>${data.ai_response}</p>`;
        }
    };
});
```

### **Step 4: Run and Interact with the Robot**

1.  **Calibrate Servos (Crucial First Step):**

      * Before fully assembling your robot, run the calibration script. This sets all servos to their neutral position.
      * While the script is running, attach the servo horns (arms) so they are correctly aligned (e.g., the pan/tilt mechanism is facing straight forward).
      * Run the script with:
        ```bash
        # Make sure your virtual environment is active
        python calibration.py
        ```
      * Follow the on-screen prompts.

2.  **Start the Main Application:**

      * Once calibration is done and the robot is assembled, run the main web server.
        ```bash
        sudo python app.py
        ```
      * The robot's LCD screen will display its IP address.

3.  **Control Your Robot:**

      * On a computer or phone connected to the same WiFi network, open a web browser and navigate to the IP address shown on the robot's display (e.g., `http://192.168.1.123`).
      * **Manual Control:** Use the on-screen D-pad for movement and the action buttons for controlling the pan/tilt head.
      * **Voice Control:** Click one of the "Speak" buttons, wait for the "Listening..." prompt, and give a command.
      * **Example Commands:**
          * "Ninja, move forward and then turn left."
          * "Ninja, what is the distance to the object in front of you?"
          * "Ninja, you seem happy." (Triggers a sound)

-----

## Part 2: Japanese Version Tutorial (日本語版チュートリアル)

このチュートリアルは、Ninjaロボットの組み立てからAI搭載ウェブインターフェースの実行までをステップバイステップで解説します。

### **ステップ1：ハードウェアとOSのセットアップ**

#### **1.1 Raspberry Pi OSの準備**

モニターやキーボードを接続せずにRaspberry Piを設定する「ヘッドレス」セットアップを行います。

1.  公式Raspberry Piウェブサイトから**Raspberry Pi Imagerをダウンロード**します。
2.  コンピュータに**microSDカードを挿入**し、Imagerを起動します。
3.  **OSを設定します：**
      * **デバイス：** Raspberry Pi Zero 2 W
      * **オペレーティングシステム：** Raspberry Pi OS (Legacy, 64-bit)。「Lite」版を推奨します。
      * **ストレージ：** microSDカードを選択します。
4.  **設定を事前構成：** 「次へ」→「設定を編集」をクリックします。
      * **一般タブ：** ホスト名（例：`ninjapi`）、ユーザー名、パスワードを設定します。
      * **WiFiを有効化：** 「ワイヤレスLANを設定する」にチェックを入れ、**2.4GHzのWiFiネットワーク**の情報を入力します。Pi Zero 2Wは5GHzネットワークをサポートしていません[1]。
      * **サービス タブ：** 「SSHを有効にする」にチェックを入れ、「パスワード認証を使う」を選択します。
5.  **イメージを書き込む：** 「保存」をクリックし、「はい」でmicroSDカードにOSを書き込みます。
6.  **初回起動：** PiにmicroSDカードを挿入し、電源を接続して数分待ちます。
7.  **SSHで接続：** 同じネットワーク上の別のコンピュータからターミナルを開き、接続します：
    ```bash
    ssh あなたのユーザー名@ninjapi.local
    ```

#### **1.2 ロボットの組み立てと配線**

以下の表に従って、すべてのコンポーネントをDFRobot IO拡張HATに接続します。

**重要：** HC-SR04センサーのECHOピンは5V信号を出力しますが、Raspberry PiのGPIOピンは3.3Vまでしか対応していません。Piの損傷を防ぐため、**必ず**分圧回路（1kΩと2kΩの抵抗）を使用してください[2, 3]。

| コンポーネント | ワイヤーの色 | DFRobot HAT上の接続 | 注記 |
| :--- | :--- | :--- | :--- |
| **パンサーボ** | オレンジ (信号) | PWMポート0, 'S'ピン | 左右の動き用 |
| | 赤 (VCC) | PWMポート0, '⊕'ピン | **外部6-12V電源に接続** |
| | 茶 (GND) | PWMポート0, '㊀'ピン | 外部電源のGND |
| **チルトサーボ** | オレンジ (信号) | PWMポート1, 'S'ピン | 上下の動き用 |
| | 赤 (VCC) | PWMポート1, '⊕'ピン | **外部6-12V電源に接続** |
| | 茶 (GND) | PWMポート1, '㊀'ピン | 外部電源のGND |
| **HC-SR04センサー** | VCC | 5V (Piから) | |
| | Trig | デジタルポート17, 'S'ピン | |
| | Echo | **分圧回路の入力へ** | **Pi保護のため必須** |
| | GND | GND | |
| **Waveshare LCD** | VCC | 3.3V | |
| | GND | GND | |
| | DIN (MOSI) | SPIポート, 'MOSI'ピン | |
| | CLK (SCLK) | SPIポート, 'SCLK'ピン | |
| | CS | SPIポート, 'SS' (CE0)ピン | |
| | DC | デジタルポート25, 'S'ピン | |
| | RST | デジタルポート24, 'S'ピン | |
| | BL | デジタルポート23, 'S'ピン | |
| **アクティブブザー** | プラス (+) | デジタルポート16, 'S'ピン | |
| | マイナス (-) | GND | |

### **ステップ2：ソフトウェアのインストール**

#### **2.1 プロジェクト環境のセットアップ**

SSHでPiに接続し、以下のコマンドを実行します。

1.  **プロジェクトディレクトリの作成：**
    ```bash
    mkdir ~/ninja_robot && cd ~/ninja_robot
    ```
2.  **Python仮想環境の作成：**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **ディレクトリ構造の作成：**
    ```bash
    mkdir -p controllers services static/css static/js templates
    touch app.py calibration.py config.json requirements.txt
    touch controllers/__init__.py controllers/servo_controller.py controllers/sensor_controller.py controllers/display_controller.py controllers/sound_controller.py
    touch services/__init__.py services/gemini_agent.py
    touch static/css/style.css static/js/main.js
    touch templates/index.html
    ```

#### **2.2 必要なライブラリのインストール**

1.  **Pythonパッケージのインストール：** `requirements.txt`に以下を追記し、`pip install -r requirements.txt`を実行します。
    ```
    Flask
    google-generativeai
    pyserial
    RPi.GPIO
    spidev
    Pillow
    gpiozero
    ```
2.  **DFRobot HATライブラリのインストール：** サーボ制御に必要です。
    ```bash
    git clone https://github.com/DFRobot/DFRobot_RaspberryPi_Expansion_Board.git
    # ライブラリフォルダをプロジェクトにコピー
    cp -r DFRobot_RaspberryPi_Expansion_Board/raspberry/DFRobot_RaspberryPi_Expansion_Board.
    ```
3.  **Waveshare LCDライブラリのインストール：** ディスプレイに必要です。
    ```bash
    wget https://files.waveshare.com/upload/8/8d/LCD_Module_RPI_code.zip
    unzip LCD_Module_RPI_code.zip
    # ライブラリをプロジェクトにコピー
    cp -r LCD_Module_RPI_code/RaspberryPi/python/lib.
    ```

#### **2.3 Gemini AIエージェントの設定**

1.  **Gemini APIキーの取得：**
      * **Google AI Studio**にアクセスします[4, 5]。
      * 「Get API key」をクリックし、「Create API key」を選択します。
      * 生成されたキーをコピーし、安全に保管します。
2.  **APIキーを安全に保存：** キーをコードに直接書き込まず、環境変数として保存します。
      * `.bashrc`ファイルを開きます：`nano ~/.bashrc`
      * ファイルの末尾にこの行を追加し、`YOUR_API_KEY`を実際のキーに置き換えます[6]：
        ```bash
        export GEMINI_API_KEY='YOUR_API_KEY'
        ```
      * 保存（Ctrl+O）、終了（Ctrl+X）し、変更を適用します：`source ~/.bashrc`

### **ステップ3：コード**

以下のコードブロックを、Raspberry Pi上の対応するファイルにコピー＆ペーストしてください。

#### **`config.json`**

ハードウェアのピン設定を保存します。

```json
{
    "servos": {
        "pan": {
            "channel": 0,
            "min_angle": -90,
            "max_angle": 90
        },
        "tilt": {
            "channel": 1,
            "min_angle": -45,
            "max_angle": 45
        },
        "drive_left": {
            "channel": 2
        },
        "drive_right": {
            "channel": 3
        }
    },
    "sensors": {
        "distance_trigger_pin": 17,
        "distance_echo_pin": 27
    },
    "display": {
        "rst_pin": 24,
        "dc_pin": 25,
        "bl_pin": 23
    },
    "sound": {
        "buzzer_pin": 16
    }
}
```

#### **`calibration.py`**

サーボの正しい中心位置を見つけるためのスクリプトです。

```python
# calibration.py
# 最終組み立ての前にこのスクリプトを実行して、すべてのサーボを0度の位置に設定します。
import time
from DFRobot_RaspberryPi_Expansion_Board import DFRobot_Expansion_Board_Servo as Servo

# DFRobotライブラリからサーボコントローラーを初期化
servo_board = Servo.DFRobot_Expansion_Board_Servo(bus_id=1, addr=0x10)
servo_board.begin()

def calibrate():
    """対話式のサーボキャリブレーションルーチン。"""
    print("--- サーボキャリブレーション ---")
    print("このスクリプトはサーボを0度（中央）の位置に動かします。")
    print("正しい位置合わせのため、スクリプト実行中にサーボホーンを取り付けてください。")
    
    while True:
        try:
            channel_str = input("テストするサーボチャンネルを入力（0-3）、終了は'q'：").strip()
            if channel_str.lower() == 'q':
                break
            
            channel = int(channel_str)
            if not 0 <= channel <= 3:
                print("無効なチャンネルです。0-3でなければなりません。")
                continue

            # DFRobotライブラリのmove関数は0-180度の角度を取ります。
            # 90度が中央位置です。
            center_angle = 90
            print(f"チャンネル{channel}のサーボを中央位置（90度）に移動中...")
            servo_board.move(channel, center_angle)
            print("サーボが中央にあります。ホーンをまっすぐ向くように取り付けてください。")

        except ValueError:
            print("無効な入力です。数値を入力してください。")
        except Exception as e:
            print(f"エラーが発生しました：{e}")

    print("キャリブレーションが終了しました。")

if __name__ == "__main__":
    calibrate()
```

#### **`controllers/servo_controller.py`**

```python
# controllers/servo_controller.py
import json
from DFRobot_RaspberryPi_Expansion_Board import DFRobot_Expansion_Board_Servo as Servo
import time

class ServoController:
    def __init__(self, config_path='config.json'):
        with open(config_path, 'r') as f:
            self.config = json.load(f)['servos']
        
        self.board = Servo.DFRobot_Expansion_Board_Servo(bus_id=1, addr=0x10)
        self.board.begin()
        self.current_angles = {name: 0 for name in self.config.keys()}
        self.center_all()

    def _map_angle(self, servo_name, angle):
        servo_info = self.config.get(servo_name, {})
        min_angle = servo_info.get('min_angle', -90)
        max_angle = servo_info.get('max_angle', 90)
        angle = max(min(angle, max_angle), min_angle)
        # 角度をmin/max範囲からDFRobotの0-180範囲にマッピング
        return int((angle - min_angle) * (180.0 / (max_angle - min_angle)))

    def set_angle(self, servo_name, angle):
        servo_info = self.config.get(servo_name)
        if not servo_info:
            print(f"エラー：サーボ'{servo_name}'が設定にありません。")
            return
        channel = servo_info['channel']
        dfrobot_angle = self._map_angle(servo_name, angle)
        self.board.move(channel, dfrobot_angle)
        self.current_angles[servo_name] = angle

    def get_current_angle(self, servo_name):
        return self.current_angles.get(servo_name, 0)

    def center_all(self):
        for name in ['pan', 'tilt']:
            if name in self.config:
                self.set_angle(name, 0)
        self.stop()
        time.sleep(0.5)

    def move_forward(self):
        self.set_angle('drive_left', 90)
        self.set_angle('drive_right', -90)

    def move_backward(self):
        self.set_angle('drive_left', -90)
        self.set_angle('drive_right', 90)

    def turn_left(self):
        self.set_angle('drive_left', -90)
        self.set_angle('drive_right', -90)

    def turn_right(self):
        self.set_angle('drive_left', 90)
        self.set_angle('drive_right', 90)

    def stop(self):
        self.set_angle('drive_left', 0)
        self.set_angle('drive_right', 0)
```

#### **`controllers/sensor_controller.py`**

```python
# controllers/sensor_controller.py
from gpiozero import DistanceSensor
import time

class SensorController:
    def __init__(self, config):
        trigger_pin = config['sensors']['distance_trigger_pin']
        echo_pin = config['sensors']['distance_echo_pin']
        self.distance_sensor = DistanceSensor(echo=echo_pin, trigger=trigger_pin)

    def get_distance(self):
        try:
            # gpiozeroは距離をメートルで返すので、cmに変換
            return self.distance_sensor.distance * 100
        except Exception as e:
            print(f"距離センサーの読み取りエラー：{e}")
            return -1.0
```

#### **`controllers/sound_controller.py`**

```python
# controllers/sound_controller.py
from gpiozero import TonalBuzzer
from gpiozero.tones import Tone
import time

class SoundController:
    def __init__(self, config):
        buzzer_pin = config['sound']['buzzer_pin']
        self.buzzer = TonalBuzzer(buzzer_pin)

    def play_tone(self, note, duration=0.1):
        try:
            self.buzzer.play(Tone(note))
            time.sleep(duration)
            self.buzzer.stop()
        except Exception as e:
            print(f"ブザーエラー：{e}")

    def play_confirmation(self):
        self.play_tone("C5")
        self.play_tone("G5")

    def play_error(self):
        self.play_tone("G4")
        self.play_tone("C4")
```

#### **`controllers/display_controller.py`**

```python
# controllers/display_controller.py
from lib import LCD_2inch
from PIL import Image, ImageDraw, ImageFont
import time

class DisplayController:
    def __init__(self, config):
        disp_config = config['display']
        self.disp = LCD_2inch.LCD_2inch()
        self.disp.Init()
        self.disp.clear()
        self.image = Image.new("RGB", (self.disp.width, self.disp.height), "BLACK")
        self.draw = ImageDraw.Draw(self.image)
        try:
            self.font_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            self.font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        except IOError:
            self.font_big = ImageFont.load_default()
            self.font_small = ImageFont.load_default()
        self.show_message("Ninja-Pi", "起動中...")

    def show_message(self, line1, line2="", line3=""):
        self.draw.rectangle((0, 0, self.disp.width, self.disp.height), fill="BLACK")
        self.draw.text((10, 5), line1, font=self.font_big, fill="WHITE")
        self.draw.text((10, 35), line2, font=self.font_small, fill="CYAN")
        self.draw.text((10, 55), line3, font=self.font_small, fill="CYAN")
        self.disp.ShowImage(self.image)
```

#### **`services/gemini_agent.py`**

```python
# services/gemini_agent.py
import os
import google.generativeai as genai

class GeminiAgent:
    def __init__(self):
        self.status = "初期化中..."
        try:
            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEYが設定されていません。")
            
            genai.configure(api_key=api_key)
            
            system_instruction = (
                "あなたはロボットアシスタントのNinja-Piです。回答は簡潔にしてください。"
                "ユーザーのコマンドに基づき、一つのアクションを決定し、の形式で応答に埋め込んでください。"
                "利用可能なアクション：move_forward, move_backward, turn_left, turn_right, stop, scan_area, report_status, happy_sound, sad_sound。"
            )
            self.model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
            self.status = "準備完了"
        except Exception as e:
            self.status = f"エラー：{e}"
            print(f"Geminiエージェント初期化エラー：{self.status}")

    def get_status(self):
        return self.status

    def ask(self, user_prompt, sensor_data={}):
        if "エラー" in self.status:
            return "AIモデルは利用できません。"
        
        context_prompt = f"センサーデータ：距離は{sensor_data.get('distance', 'N/A')} cmです。ユーザーコマンド：「{user_prompt}」"
        
        try:
            self.status = "思考中..."
            response = self.model.generate_content(context_prompt)
            self.status = "準備完了"
            return response.text
        except Exception as e:
            self.status = "エラー"
            return f"AIエラー：{e}"
```

#### **`app.py`**

メインのウェブサーバーアプリケーションです。

```python
# app.py
import json
import time
import threading
import socket
from flask import Flask, render_template, request, jsonify, Response

from controllers.servo_controller import ServoController
from controllers.sensor_controller import SensorController
from controllers.display_controller import DisplayController
from controllers.sound_controller import SoundController
from services.gemini_agent import GeminiAgent

app = Flask(__name__)

# --- 初期化 ---
with open('config.json', 'r') as f:
    config = json.load(f)

servo_controller = ServoController(config_path='config.json')
sensor_controller = SensorController(config)
display_controller = DisplayController(config)
sound_controller = SoundController(config)
gemini_agent = GeminiAgent()

robot_state = {"distance": 0, "ai_response": "コマンド待機中...", "last_command": "なし"}

# --- バックグラウンドタスク ---
def update_sensors():
    global robot_state
    while True:
        dist = sensor_controller.get_distance()
        robot_state["distance"] = f"{dist:.1f}" if dist!= -1.0 else "エラー"
        time.sleep(0.5)

threading.Thread(target=update_sensors, daemon=True).start()

# --- コマンド実行 ---
def parse_and_execute(ai_text):
    try:
        if "" in ai_text:
            start = ai_text.find("", start)
            command = ai_text[start:end].strip()
            
            robot_state["last_command"] = f"AI: {command}"
            sound_controller.play_confirmation()

            actions = {
                "move_forward": servo_controller.move_forward, "move_backward": servo_controller.move_backward,
                "turn_left": servo_controller.turn_left, "turn_right": servo_controller.turn_right,
                "stop": servo_controller.stop, "happy_sound": sound_controller.play_confirmation,
                "sad_sound": sound_controller.play_error,
                "scan_area": lambda: [servo_controller.set_angle('pan', a) or time.sleep(0.5) for a in [-45, 0, 45, 0]],
                "report_status": lambda: robot_state.update({"ai_response": f"距離は{robot_state['distance']} cmです。"})
            }
            if command in actions:
                actions[command]()
    except Exception as e:
        print(f"AIコマンドの実行エラー：{e}")
        sound_controller.play_error()

# --- Flaskルート ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/command', methods=)
def command():
    action = request.get_json().get('action')
    robot_state["last_command"] = f"Web: {action}"
    
    actions = {
        'forward': servo_controller.move_forward, 'backward': servo_controller.move_backward,
        'left': servo_controller.turn_left, 'right': servo_controller.turn_right, 'stop': servo_controller.stop,
        'pan_left': lambda: servo_controller.set_angle('pan', servo_controller.get_current_angle('pan') + 15),
        'pan_right': lambda: servo_controller.set_angle('pan', servo_controller.get_current_angle('pan') - 15),
        'tilt_up': lambda: servo_controller.set_angle('tilt', servo_controller.get_current_angle('tilt') + 10),
        'tilt_down': lambda: servo_controller.set_angle('tilt', servo_controller.get_current_angle('tilt') - 10),
    }
    if action in actions:
        actions[action]()
        return jsonify(status="success")
    return jsonify(status="error", message="不明なコマンド"), 400

@app.route('/voice_command', methods=)
def voice_command():
    prompt = request.get_json().get('prompt')
    robot_state["last_command"] = f"音声: {prompt}"
    ai_response = gemini_agent.ask(prompt, {"distance": robot_state["distance"]})
    robot_state["ai_response"] = ai_response
    parse_and_execute(ai_response)
    return jsonify(status="success", response=ai_response)

@app.route('/stream')
def stream():
    def event_stream():
        while True:
            data_to_send = {
                "distance": robot_state['distance'],
                "pan": servo_controller.get_current_angle('pan'),
                "tilt": servo_controller.get_current_angle('tilt'),
                "ai_status": gemini_agent.get_status(),
                "ai_response": robot_state["ai_response"],
                "last_command": robot_state["last_command"]
            }
            yield f"data: {json.dumps(data_to_send)}\n\n"
            time.sleep(0.5)
    return Response(event_stream(), mimetype="text/event-stream")

if __name__ == '__main__':
    # 表示用のローカルIPを取得
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()

    display_controller.show_message("Ninja-Pi 準備完了!", f"IP: {IP}")
    sound_controller.play_confirmation()
    app.run(host='0.0.0.0', port=80, debug=False)
```

#### **`templates/index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ninja-Pi コマンドセンター</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div class="container">
        <div class="controller">
            <div class="d-pad">
                <div id="btn-up" class="d-pad-btn">▲</div>
                <div id="btn-down" class="d-pad-btn">▼</div>
                <div id="btn-left" class="d-pad-btn">◄</div>
                <div id="btn-right" class="d-pad-btn">►</div>
            </div>
            <div class="center-panel">
                <div class="brand">NINJA-PI</div>
                <div id="voice-controls">
                    <button id="btn-voice-en">Speak (EN)</button>
                    <button id="btn-voice-ja">話す (JA)</button>
                    <button id="btn-voice-zh">说话 (ZH)</button>
                </div>
                <div id="voice-status">ステータス: アイドル</div>
            </div>
            <div class="action-buttons">
                <div id="btn-triangle" class="action-btn">△</div>
                <div id="btn-circle" class="action-btn">○</div>
                <div id="btn-cross" class="action-btn">✕</div>
                <div id="btn-square" class="action-btn">□</div>
            </div>
        </div>
        <div class="interface-panels">
            <div class="panel ai-panel">
                <h2>AIの応答</h2>
                <div id="ai-response-box" class="scroll-box">待機中...</div>
            </div>
            <div class="panel debug-panel">
                <h2>デバッグ情報</h2>
                <div id="debug-box">
                    <p>距離: <span id="debug-distance">--</span> cm</p>
                    <p>パン/チルト: <span id="debug-pan">--</span>° / <span id="debug-tilt">--</span>°</p>
                    <p>AIステータス: <span id="debug-ai-status">--</span></p>
                    <p>最後のコマンド: <span id="debug-last-command">--</span></p>
                </div>
            </div>
        </div>
    </div>
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>
```

#### **`static/css/style.css`**

```css
body { background-color: #1a1a1d; color: #c5c6c7; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.container { width: 90%; max-width: 800px; display: flex; flex-direction: column; gap: 20px; }
.controller { background-color: #333; border-radius: 15px; padding: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 8px rgba(0,0,0,0.5); }
.d-pad,.action-buttons { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; width: 150px; height: 150px; }
.d-pad-btn,.action-btn { background-color: #4f545c; border: 2px solid #2a2d31; display: flex; justify-content: center; align-items: center; font-size: 24px; cursor: pointer; user-select: none; transition: background-color 0.1s; }
.d-pad-btn:active,.action-btn:active { background-color: #6b717a; }
#btn-up { grid-column: 2; grid-row: 1; }
#btn-down { grid-column: 2; grid-row: 3; }
#btn-left { grid-column: 1; grid-row: 2; }
#btn-right { grid-column: 3; grid-row: 2; }
#btn-triangle { grid-column: 2; grid-row: 1; color: #4CAF50; border-radius: 50%; }
#btn-circle { grid-column: 3; grid-row: 2; color: #F44336; border-radius: 50%; }
#btn-cross { grid-column: 2; grid-row: 3; color: #2196F3; border-radius: 50%; }
#btn-square { grid-column: 1; grid-row: 2; color: #f0f; border-radius: 50%; }
.center-panel { text-align: center; }
.brand { font-size: 2em; font-weight: bold; color: #61dafb; margin-bottom: 15px; }
#voice-controls button { background-color: #0d6efd; color: white; border: none; padding: 10px; margin: 5px; border-radius: 5px; cursor: pointer; }
#voice-controls button:hover { background-color: #0b5ed7; }
#voice-status { margin-top: 10px; color: #9fa3a7; min-height: 20px; }
.interface-panels { display: flex; gap: 20px; width: 100%; }
.panel { background-color: #2b2d31; border-radius: 8px; padding: 15px; flex: 1; }
.panel h2 { margin-top: 0; color: #61dafb; border-bottom: 1px solid #444; padding-bottom: 10px; }
.scroll-box { height: 100px; overflow-y: auto; background-color: #1a1a1d; padding: 10px; border-radius: 5px; }
#debug-box p { margin: 8px 0; }
```

#### **`static/js/main.js`**

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const sendCommand = (action) => {
        fetch('/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        }).catch(err => console.error('コマンドエラー:', err));
    };

    // 移動コントロール
    const movementButtons = {
        'btn-up': 'forward', 'btn-down': 'backward',
        'btn-left': 'left', 'btn-right': 'right'
    };
    for (const [id, action] of Object.entries(movementButtons)) {
        const btn = document.getElementById(id);
        btn.addEventListener('mousedown', () => sendCommand(action));
        btn.addEventListener('mouseup', () => sendCommand('stop'));
        btn.addEventListener('mouseleave', () => sendCommand('stop'));
    }

    // パン/チルトコントロール
    document.getElementById('btn-triangle').addEventListener('click', () => sendCommand('tilt_up'));
    document.getElementById('btn-square').addEventListener('click', () => sendCommand('pan_left'));
    document.getElementById('btn-circle').addEventListener('click', () => sendCommand('pan_right'));
    document.getElementById('btn-cross').addEventListener('click', () => sendCommand('tilt_down'));

    // 音声認識
    const SpeechRecognition = window.SpeechRecognition |

| window.webkitSpeechRecognition;
    const voiceStatus = document.getElementById('voice-status');
    const aiResponseBox = document.getElementById('ai-response-box');

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;

        const setupRecognition = (lang) => {
            recognition.lang = lang;
            recognition.start();
            voiceStatus.textContent = '聞き取り中...';
        };

        document.getElementById('btn-voice-en').addEventListener('click', () => setupRecognition('en-US'));
        document.getElementById('btn-voice-ja').addEventListener('click', () => setupRecognition('ja-JP'));
        document.getElementById('btn-voice-zh').addEventListener('click', () => setupRecognition('cmn-Hans-CN'));

        recognition.onresult = (event) => {
            const transcript = event.results.transcript;
            voiceStatus.textContent = `認識結果: "${transcript}"`;
            aiResponseBox.innerHTML = '<p><i>AIに送信中...</i></p>';

            fetch('/voice_command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: transcript })
            })
           .then(response => response.json())
           .then(data => { aiResponseBox.innerHTML = `<p>${data.response}</p>`; })
           .catch(error => { aiResponseBox.innerHTML = '<p>AIエラー。</p>'; });
        };
        recognition.onerror = (event) => { voiceStatus.textContent = `エラー: ${event.error}`; };
        recognition.onend = () => { if (voiceStatus.textContent === '聞き取り中...') voiceStatus.textContent = 'ステータス: アイドル'; };
    } else {
        voiceStatus.textContent = '音声認識はサポートされていません。';
    }

    // デバッグパネル用サーバー送信イベント
    const eventSource = new EventSource("/stream");
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        document.getElementById('debug-distance').textContent = data.distance;
        document.getElementById('debug-pan').textContent = data.pan;
        document.getElementById('debug-tilt').textContent = data.tilt;
        document.getElementById('debug-ai-status').textContent = data.ai_status;
        document.getElementById('debug-last-command').textContent = data.last_command;
        if (!aiResponseBox.innerHTML.includes('<i>')) {
            aiResponseBox.innerHTML = `<p>${data.ai_response}</p>`;
        }
    };
});
```

### **ステップ4：ロボットの実行と操作**

1.  **サーボのキャリブレーション（最重要の最初のステップ）：**

      * ロボットを完全に組み立てる前に、キャリブレーションスクリプトを実行します。これにより、すべてのサーボがニュートラル位置に設定されます。
      * スクリプトの実行中に、サーボホーン（アーム）を正しく位置合わせして（例：パンチルト機構が正面を向くように）取り付けます。
      * スクリプトを以下で実行します：
        ```bash
        # 仮想環境が有効であることを確認してください
        python calibration.py
        ```
      * 画面の指示に従ってください。

2.  **メインアプリケーションの起動：**

      * キャリブレーションが完了し、ロボットが組み立てられたら、メインのウェブサーバーを実行します。
        ```bash
        sudo python app.py
        ```
      * ロボットのLCD画面にIPアドレスが表示されます。

3.  **ロボットの制御：**

      * 同じWiFiネットワークに接続されたコンピュータやスマートフォンでウェブブラウザを開き、ロボットのディスプレイに表示されたIPアドレス（例：`http://192.168.1.123`）にアクセスします。
      * **手動制御：** 画面上の十字キーで移動、アクションボタンでパンチルトヘッドを制御します。
      * **音声制御：** 「Speak」ボタンのいずれかをクリックし、「Listening...」の表示を待ってからコマンドを話します。
      * **コマンドの例：**
          * 「ニンジャ、前に進んでから左に曲がって。」
          * 「ニンジャ、目の前の物体までの距離は？」
          * 「ニンジャ、楽しそうだね。」（音を鳴らします）
