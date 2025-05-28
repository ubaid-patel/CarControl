from flask import Flask, send_from_directory, jsonify
import logging
from flask_cors import CORS
import requests  # For proxying requests to ESP32

app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)
logging.basicConfig(level=logging.INFO)

ESP32_BASE_URL = "http://192.168.113.159"  # Change to your ESP32 IP

# Serve the main page
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Serve static files like CSS, JS
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Original movement commands handled directly in Flask
@app.route('/test/<action>')
def control_action(action):
    print('Running test')
    valid_actions = {
        'forward': 'Moving Forward',
        'backward': 'Moving Backward',
        'left': 'Turning Left',
        'right': 'Turning Right',
        'stop': 'Stopping'
    }
    
    if action in valid_actions:
        app.logger.info(f"Command: {action.upper()}")
        return jsonify({'status': valid_actions[action]})
    else:
        abort(404, description="Invalid command")

# --- New: Proxy route to forward commands to the ESP32 ---
@app.route('/esp/<action>')
def esp_proxy(action):
    print('Accessing ESP')
    try:
        esp_url = f"{ESP32_BASE_URL}/{action}"
        esp_response = requests.get(esp_url, timeout=3)
        app.logger.info(f"Proxy to ESP: {esp_url} => {esp_response.text}")
        return jsonify({'esp_response': esp_response.text})
    except requests.exceptions.RequestException as e:
        app.logger.error(f"ESP request failed: {e}")
        return jsonify({'error': 'Failed to reach ESP32'}), 500

if __name__ == '__main__':
    # Run Flask with HTTPS enabled (make sure cert.pem and key.pem exist)
    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=('cert.pem', 'key.pem'))
