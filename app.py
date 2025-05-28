from flask import Flask, send_from_directory, jsonify
import logging

app = Flask(__name__, static_url_path='', static_folder='.')

# Enable logging for debug output in terminal
logging.basicConfig(level=logging.INFO)

# Route for the main HTML page
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Serve CSS, JS, etc.
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# === Movement Command Routes ===
@app.route('/forward')
def forward():
    app.logger.info("Command: FORWARD")
    return jsonify({'status': 'Moving Forward'})

@app.route('/backward')
def backward():
    app.logger.info("Command: BACKWARD")
    return jsonify({'status': 'Moving Backward'})

@app.route('/left')
def left():
    app.logger.info("Command: LEFT")
    return jsonify({'status': 'Turning Left'})

@app.route('/right')
def right():
    app.logger.info("Command: RIGHT")
    return jsonify({'status': 'Turning Right'})

@app.route('/stop')
def stop():
    app.logger.info("Command: STOP")
    return jsonify({'status': 'Stopping'})

# Start the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
