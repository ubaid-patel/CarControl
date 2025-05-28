var ESPIP = '';
(localStorage.getItem('ESP_IP')==true?ESPIP:ESPIP='')
console.log(ESPIP)
// Configuring ESP IP address
const settingsTab = document.getElementById('settings-tab');
const settingsPanel = document.getElementById('settings-panel');
const saveBtn = document.getElementById('save-ip');
const ipInput = document.getElementById('esp-ip');

settingsTab.addEventListener('click', () => {
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
});

saveBtn.addEventListener('click', () => {
  const ip = ipInput.value.trim();
  if (ip) {
    localStorage.setItem('ESP_IP', ip);
    ESPIP = ip;
    console.log(ESPIP)
    document.getElementById('status').textContent = "ESP IP Saved: " + ip;
    settingsPanel.style.display = 'none';
  }
});

window.addEventListener('load', () => {
  const saved = localStorage.getItem('ESP_IP');
  if (saved) ipInput.value = saved;
});


function sendCommand(direction, label) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${ESPIP}/` + direction, true);
    xhr.onload = function () {
        const status = document.getElementById('status');
        if (xhr.status === 200) {
            status.textContent = 'Action: ' + label;
            status.classList.add('status-update');
            setTimeout(() => status.classList.remove('status-update'), 800);
        } else {
            status.textContent = 'Error: ' + xhr.status;
        }
    };
    xhr.onerror = function () {
        document.getElementById('status').textContent = 'Request failed';
    };
    xhr.send();
}

// === Button Click Events ===
document.getElementById("forward").addEventListener("click", () => sendCommand("forward", "Moving Forward"));
document.getElementById("backward").addEventListener("click", () => sendCommand("backward", "Moving Backward"));
document.getElementById("left").addEventListener("click", () => sendCommand("left", "Turning Left"));
document.getElementById("right").addEventListener("click", () => sendCommand("right", "Turning Right"));
document.getElementById("stop").addEventListener("click", () => sendCommand("stop", "Stopping"));

// === Voice Control ===
document.getElementById("voiceControl").addEventListener("click", () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support Speech Recognition.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        document.getElementById('status').textContent = "Listening for voice command...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        let matched = false;

        if (transcript.includes("forward")) sendCommand("forward", "Voice: Moving Forward"), matched = true;
        else if (transcript.includes("backward")) sendCommand("backward", "Voice: Moving Backward"), matched = true;
        else if (transcript.includes("left")) sendCommand("left", "Voice: Turning Left"), matched = true;
        else if (transcript.includes("right")) sendCommand("right", "Voice: Turning Right"), matched = true;
        else if (transcript.includes("stop")) sendCommand("stop", "Voice: Stopping"), matched = true;

        if (!matched) {
            document.getElementById('status').textContent = "Voice command not recognized.";
        }
    };

    recognition.onerror = (event) => {
        document.getElementById('status').textContent = "Voice Error: " + event.error;
    };

    recognition.start();
});

// === Tilt Control ===
let tiltActive = false;

document.getElementById("tiltControl").addEventListener("click", () => {
    if (!tiltActive) {
        window.addEventListener("deviceorientation", handleTilt);
        tiltActive = true;
        document.getElementById('status').textContent = "Tilt control activated.";
    } else {
        window.removeEventListener("deviceorientation", handleTilt);
        tiltActive = false;
        document.getElementById('status').textContent = "Tilt control deactivated.";
    }
});

let lastTiltDirection = null; // Stores last sent tilt direction

function handleTilt(event) {
    const { beta, gamma } = event;

    let newDirection = "stop";

    if (beta > 30) newDirection = "forward";
    else if (beta < -30) newDirection = "backward";
    else if (gamma > 30) newDirection = "right";
    else if (gamma < -30) newDirection = "left";

    // Only send if direction changed
    if (newDirection !== lastTiltDirection) {
        lastTiltDirection = newDirection;

        let label = "";
        switch (newDirection) {
            case "forward":
                label = "Tilt: Moving Forward";
                break;
            case "backward":
                label = "Tilt: Moving Backward";
                break;
            case "left":
                label = "Tilt: Turning Left";
                break;
            case "right":
                label = "Tilt: Turning Right";
                break;
            default:
                label = "Tilt: Stopping";
        }

        sendCommand(newDirection, label);
    }
}

