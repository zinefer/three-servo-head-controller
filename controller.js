// ESP32 Servo Controller - Load from GitHub Gist
// This script injects the UI and handles communication with the ESP32

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        updateInterval: 50, // ms between updates (20Hz)
        endpoint: '/update' // ESP32 endpoint for position updates
    };

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }

        body {
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            touch-action: none;
        }

        .container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
        }

        /* Slider Section */
        .slider-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            height: 100%;
            justify-content: center;
        }

        .slider-container {
            position: relative;
            width: 60px;
            height: 400px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 30px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .slider-track {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: calc(100% - 20px);
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }

        .slider-thumb {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            cursor: pointer;
            transition: transform 0.1s;
            touch-action: none;
        }

        .slider-thumb:active {
            transform: translateX(-50%) scale(1.1);
        }

        .slider-value {
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            min-width: 60px;
            text-align: center;
        }

        /* Joystick Section */
        .joystick-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            height: 100%;
            justify-content: center;
        }

        .joystick-container {
            position: relative;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border: 3px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .joystick-base {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 160px;
            height: 160px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .joystick-stick {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            cursor: pointer;
            transition: transform 0.1s;
            touch-action: none;
        }

        .joystick-stick:active {
            transform: translate(-50%, -50%) scale(1.1);
        }

        .joystick-crosshair {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }

        .joystick-crosshair::before,
        .joystick-crosshair::after {
            content: '';
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
        }

        .joystick-crosshair::before {
            width: 160px;
            height: 2px;
            top: 0;
            left: -80px;
        }

        .joystick-crosshair::after {
            width: 2px;
            height: 160px;
            left: 0;
            top: -80px;
        }

        .joystick-values {
            color: white;
            font-size: 18px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            text-align: center;
            line-height: 1.5;
        }

        /* Toggle Switches */
        .toggle-container {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 15px;
            border-radius: 25px;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .toggle-label {
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .toggle-switch {
            position: relative;
            width: 50px;
            height: 28px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 14px;
            cursor: pointer;
            transition: background 0.3s;
        }

        .toggle-switch.active {
            background: #4ade80;
        }

        .toggle-slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.active .toggle-slider {
            transform: translateX(22px);
        }

        /* Status indicator */
        .status {
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.5);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
        }

        .status.connected { background: rgba(74, 222, 128, 0.8); }
        .status.error { background: rgba(239, 68, 68, 0.8); }

        /* Control panel */
        .control-panel {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 90%;
            z-index: 1000;
        }

        .control-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            backdrop-filter: blur(10px);
        }

        .control-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .control-btn.active {
            background: rgba(239, 68, 68, 0.8);
            border-color: rgba(239, 68, 68, 1);
        }

        .control-btn.recording {
            background: rgba(220, 38, 38, 0.8);
            animation: pulse 1s infinite;
        }

        .control-btn.playing {
            background: rgba(34, 197, 94, 0.8);
        }

        .control-btn.autonomous {
            background: rgba(168, 85, 247, 0.8);
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .control-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    // Inject HTML
    document.body.innerHTML = `
        <div class="status" id="status">Connecting...</div>
        <div class="container">
            <!-- Slider Section -->
            <div class="slider-section">
                <div class="slider-value" id="sliderValue">50</div>
                <div class="slider-container" id="sliderContainer">
                    <div class="slider-track"></div>
                    <div class="slider-thumb" id="sliderThumb"></div>
                </div>
                <div class="toggle-container">
                    <span class="toggle-label">Sticky</span>
                    <div class="toggle-switch" id="sliderToggle">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
                <div class="toggle-container">
                    <span class="toggle-label">👁️ Eyes</span>
                    <div class="toggle-switch active" id="eyesToggle">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>

            <!-- Joystick Section -->
            <div class="joystick-section">
                <div class="joystick-values" id="joystickValues">L: 90<br>R: 90</div>
                <div class="joystick-container" id="joystickContainer">
                    <div class="joystick-base"></div>
                    <div class="joystick-crosshair"></div>
                    <div class="joystick-stick" id="joystickStick"></div>
                </div>
                <div class="toggle-container">
                    <span class="toggle-label">Sticky</span>
                    <div class="toggle-switch" id="joystickToggle">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="control-panel">
            <button class="control-btn" id="autonomousBtn">🎃 Spooky Mode</button>
            <button class="control-btn" id="recordBtn">⏺️ Record</button>
            <button class="control-btn" id="playBtn" disabled>▶️ Play</button>
            <button class="control-btn" id="clearBtn" disabled>🗑️ Clear</button>
        </div>
    `;

    // State management
    let currentValues = {
        servo1: 90,  // Slider value (0-180)
        servo2: 90,  // Left servo from joystick (0-180)
        servo3: 90,  // Right servo from joystick (0-180)
        eyes: true   // Eyes state (on/off)
    };

    let lastSentValues = { ...currentValues };
    let updateTimer = null;
    let pendingRequest = false;

    // Autonomous mode state
    let autonomousMode = false;
    let autonomousTimer = null;
    let autonomousTargets = { servo1: 90, servo2: 90, servo3: 90 };
    let autonomousCurrent = { servo1: 90, servo2: 90, servo3: 90 };
    let autonomousSpeed = 0.02; // Interpolation speed

    // Recording state
    let isRecording = false;
    let isPlaying = false;
    let recordedFrames = [];
    let recordingStartTime = 0;
    let playbackStartTime = 0;
    let playbackTimer = null;

    // Transform joystick X/Y to differential servo values
    function transformJoystick(x, y) {
        // x and y are in range -100 to 100
        // y: forward/backward (base speed)
        // x: steering (left/right)
        
        // Convert to 0-180 range
        const baseSpeed = ((y + 100) / 200) * 180; // 0 at bottom, 180 at top
        
        // Calculate left and right servo values
        let leftServo = baseSpeed;
        let rightServo = baseSpeed;
        
        // Apply steering
        // x < 0 means joystick is left, reduce left servo
        // x > 0 means joystick is right, reduce right servo
        const steeringAmount = Math.abs(x) / 100 * baseSpeed; // Proportional to base speed
        
        if (x < 0) {
            // Turning left - reduce left servo
            leftServo = Math.max(0, baseSpeed - steeringAmount);
        } else if (x > 0) {
            // Turning right - reduce right servo
            rightServo = Math.max(0, baseSpeed - steeringAmount);
        }
        
        return {
            left: Math.round(leftServo),
            right: Math.round(rightServo)
        };
    }

    // Send update to ESP32
    function sendUpdate() {
        if (pendingRequest) return;
        
        // Check if values have changed
        if (currentValues.servo1 === lastSentValues.servo1 &&
            currentValues.servo2 === lastSentValues.servo2 &&
            currentValues.servo3 === lastSentValues.servo3 &&
            currentValues.eyes === lastSentValues.eyes) {
            return;
        }

        pendingRequest = true;
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', CONFIG.endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            pendingRequest = false;
            if (xhr.status === 200) {
                lastSentValues = { ...currentValues };
                updateStatus('connected');
            } else {
                updateStatus('error', 'Update failed');
            }
        };
        
        xhr.onerror = function() {
            pendingRequest = false;
            updateStatus('error', 'Connection lost');
        };
        
        xhr.send(JSON.stringify(currentValues));
    }

    // Update status indicator
    function updateStatus(state, message) {
        const status = document.getElementById('status');
        status.className = 'status ' + state;
        status.textContent = message || state;
    }

    // Start periodic updates
    function startUpdates() {
        if (updateTimer) clearInterval(updateTimer);
        updateTimer = setInterval(sendUpdate, CONFIG.updateInterval);
        updateStatus('connected', 'Connected');
    }

    // ===== AUTONOMOUS MODE =====
    function startAutonomousMode() {
        autonomousMode = true;
        setRandomTargets();
        
        if (autonomousTimer) clearInterval(autonomousTimer);
        autonomousTimer = setInterval(() => {
            // Smoothly interpolate towards targets
            autonomousCurrent.servo1 += (autonomousTargets.servo1 - autonomousCurrent.servo1) * autonomousSpeed;
            autonomousCurrent.servo2 += (autonomousTargets.servo2 - autonomousCurrent.servo2) * autonomousSpeed;
            autonomousCurrent.servo3 += (autonomousTargets.servo3 - autonomousCurrent.servo3) * autonomousSpeed;
            
            // Update current values (disable manual control)
            currentValues.servo1 = Math.round(autonomousCurrent.servo1);
            currentValues.servo2 = Math.round(autonomousCurrent.servo2);
            currentValues.servo3 = Math.round(autonomousCurrent.servo3);
            
            // Update UI
            updateSliderFromValue(currentValues.servo1);
            updateJoystickFromValues(currentValues.servo2, currentValues.servo3);
            
            // Check if close to target, set new random target
            const dist1 = Math.abs(autonomousTargets.servo1 - autonomousCurrent.servo1);
            const dist2 = Math.abs(autonomousTargets.servo2 - autonomousCurrent.servo2);
            const dist3 = Math.abs(autonomousTargets.servo3 - autonomousCurrent.servo3);
            
            if (dist1 < 2 && dist2 < 2 && dist3 < 2) {
                setRandomTargets();
            }
        }, 50);
    }
    
    function stopAutonomousMode() {
        autonomousMode = false;
        if (autonomousTimer) {
            clearInterval(autonomousTimer);
            autonomousTimer = null;
        }
    }
    
    function setRandomTargets() {
        // Random targets with preference for slower, more natural movements
        // Bias towards center for more subtle movements
        const randomInRange = (min, max, centerBias = 0.3) => {
            const center = (min + max) / 2;
            if (Math.random() < centerBias) {
                // Bias towards center range
                return center + (Math.random() - 0.5) * (max - min) * 0.5;
            }
            return min + Math.random() * (max - min);
        };
        
        autonomousTargets.servo1 = randomInRange(30, 150);
        autonomousTargets.servo2 = randomInRange(30, 150);
        autonomousTargets.servo3 = randomInRange(30, 150);
    }
    
    function updateSliderFromValue(value) {
        const rect = sliderContainer.getBoundingClientRect();
        const minY = 25;
        const maxY = rect.height - 25;
        const y = maxY - ((value / 180) * (maxY - minY));
        sliderThumb.style.top = y + 'px';
        sliderValue.textContent = value;
    }
    
    function updateJoystickFromValues(left, right) {
        // Reverse the differential steering calculation
        const baseSpeed = (left + right) / 2;
        const steering = left - right; // Positive = turning right, negative = turning left
        
        // Convert back to joystick coordinates
        const maxRadius = 60;
        const y = ((baseSpeed / 180) * 200 - 100); // -100 to 100
        const x = -(steering / baseSpeed) * 100 || 0; // -100 to 100
        
        const deltaX = (x / 100) * maxRadius;
        const deltaY = -(y / 100) * maxRadius;
        
        joystickStick.style.left = (100 + deltaX) + 'px';
        joystickStick.style.top = (100 + deltaY) + 'px';
        joystickValues.innerHTML = `L: ${left}<br>R: ${right}`;
    }

    // ===== RECORDING & PLAYBACK =====
    function startRecording() {
        isRecording = true;
        recordedFrames = [];
        recordingStartTime = Date.now();
        document.getElementById('recordBtn').classList.add('recording');
        updateStatus('connected', '🔴 Recording...');
        
        // Record current frame every 100ms
        const recordInterval = setInterval(() => {
            if (!isRecording) {
                clearInterval(recordInterval);
                return;
            }
            
            recordedFrames.push({
                time: Date.now() - recordingStartTime,
                servo1: currentValues.servo1,
                servo2: currentValues.servo2,
                servo3: currentValues.servo3,
                eyes: currentValues.eyes
            });
        }, 100);
    }
    
    function stopRecording() {
        isRecording = false;
        document.getElementById('recordBtn').classList.remove('recording');
        document.getElementById('playBtn').disabled = recordedFrames.length === 0;
        document.getElementById('clearBtn').disabled = recordedFrames.length === 0;
        updateStatus('connected', `✅ Recorded ${recordedFrames.length} frames`);
        console.log('Recording saved:', recordedFrames.length, 'frames');
    }
    
    function startPlayback() {
        if (recordedFrames.length === 0) return;
        
        isPlaying = true;
        playbackStartTime = Date.now();
        document.getElementById('playBtn').classList.add('playing');
        document.getElementById('recordBtn').disabled = true;
        updateStatus('connected', '▶️ Playing...');
        
        let frameIndex = 0;
        
        playbackTimer = setInterval(() => {
            const elapsed = Date.now() - playbackStartTime;
            
            // Find the appropriate frame
            while (frameIndex < recordedFrames.length && recordedFrames[frameIndex].time <= elapsed) {
                const frame = recordedFrames[frameIndex];
                currentValues.servo1 = frame.servo1;
                currentValues.servo2 = frame.servo2;
                currentValues.servo3 = frame.servo3;
                currentValues.eyes = frame.eyes;
                
                // Update UI
                updateSliderFromValue(frame.servo1);
                updateJoystickFromValues(frame.servo2, frame.servo3);
                
                // Update eyes toggle
                const eyesToggle = document.getElementById('eyesToggle');
                if (frame.eyes) {
                    eyesToggle.classList.add('active');
                } else {
                    eyesToggle.classList.remove('active');
                }
                
                frameIndex++;
            }
            
            // Check if playback finished
            if (frameIndex >= recordedFrames.length) {
                stopPlayback();
            }
        }, 50);
    }
    
    function stopPlayback() {
        isPlaying = false;
        if (playbackTimer) {
            clearInterval(playbackTimer);
            playbackTimer = null;
        }
        document.getElementById('playBtn').classList.remove('playing');
        document.getElementById('recordBtn').disabled = false;
        updateStatus('connected', '✅ Playback complete');
    }
    
    function clearRecording() {
        recordedFrames = [];
        document.getElementById('playBtn').disabled = true;
        document.getElementById('clearBtn').disabled = true;
        updateStatus('connected', '🗑️ Recording cleared');
    }

    // Eyes toggle
    const eyesToggle = document.getElementById('eyesToggle');
    
    function toggleEyes() {
        currentValues.eyes = !currentValues.eyes;
        eyesToggle.classList.toggle('active');
    }
    
    eyesToggle.addEventListener('click', toggleEyes);
    eyesToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    eyesToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleEyes();
    });

    // Control panel buttons
    const autonomousBtn = document.getElementById('autonomousBtn');
    const recordBtn = document.getElementById('recordBtn');
    const playBtn = document.getElementById('playBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    autonomousBtn.addEventListener('click', () => {
        if (autonomousMode) {
            stopAutonomousMode();
            autonomousBtn.classList.remove('autonomous');
            autonomousBtn.textContent = '🎃 Spooky Mode';
            updateStatus('connected', 'Manual mode');
        } else {
            stopPlayback(); // Stop playback if running
            startAutonomousMode();
            autonomousBtn.classList.add('autonomous');
            autonomousBtn.textContent = '👻 Stop Spooky';
            updateStatus('connected', '👻 Spooky mode active');
        }
    });
    
    recordBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
            recordBtn.textContent = '⏺️ Record';
        } else {
            stopAutonomousMode(); // Stop autonomous if running
            autonomousBtn.classList.remove('autonomous');
            autonomousBtn.textContent = '🎃 Spooky Mode';
            stopPlayback(); // Stop playback if running
            startRecording();
            recordBtn.textContent = '⏹️ Stop';
        }
    });
    
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopPlayback();
            playBtn.textContent = '▶️ Play';
        } else {
            stopAutonomousMode(); // Stop autonomous if running
            autonomousBtn.classList.remove('autonomous');
            autonomousBtn.textContent = '🎃 Spooky Mode';
            startPlayback();
            playBtn.textContent = '⏹️ Stop';
        }
    });
    
    clearBtn.addEventListener('click', () => {
        if (confirm('Clear recorded movements?')) {
            clearRecording();
        }
    });

    // Slider Logic
    const sliderContainer = document.getElementById('sliderContainer');
    const sliderThumb = document.getElementById('sliderThumb');
    const sliderValue = document.getElementById('sliderValue');
    const sliderToggle = document.getElementById('sliderToggle');
    
    let sliderSticky = false;
    let sliderTouchId = null;
    let sliderOrigin = null;
    let sliderMouseActive = false;

    function toggleSliderSticky() {
        sliderSticky = !sliderSticky;
        sliderToggle.classList.toggle('active');
        
        // When turning sticky ON while actively dragging, save current position as origin
        if (sliderSticky && (sliderTouchId !== null || sliderMouseActive)) {
            const rect = sliderContainer.getBoundingClientRect();
            const thumbRect = sliderThumb.getBoundingClientRect();
            sliderOrigin = thumbRect.top + thumbRect.height / 2 - rect.top;
        } 
        // When turning sticky OFF, clear the origin so it resets to center
        else if (!sliderSticky) {
            sliderOrigin = null;
        }
    }

    sliderToggle.addEventListener('click', toggleSliderSticky);
    sliderToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    sliderToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSliderSticky();
    });

    function updateSlider(clientY) {
        // Stop autonomous/playback if user takes manual control
        if (autonomousMode) {
            stopAutonomousMode();
            autonomousBtn.classList.remove('autonomous');
            autonomousBtn.textContent = '🎃 Spooky Mode';
        }
        if (isPlaying) {
            stopPlayback();
            playBtn.textContent = '▶️ Play';
        }
        
        const rect = sliderContainer.getBoundingClientRect();
        let y = clientY - rect.top;
        
        const minY = 25;
        const maxY = rect.height - 25;
        y = Math.max(minY, Math.min(maxY, y));
        
        sliderThumb.style.top = y + 'px';
        
        // Calculate value (0-180, inverted so top = 180)
        const value = Math.round(((maxY - y) / (maxY - minY)) * 180);
        sliderValue.textContent = value;
        currentValues.servo1 = value;
        
        // Update recording if active
        if (isRecording) {
            // Recording happens in the interval
        }
    }

    function resetSlider() {
        const rect = sliderContainer.getBoundingClientRect();
        const minY = 25;
        const maxY = rect.height - 25;
        
        // If sticky mode and we have a stored origin, use it
        // Otherwise, reset to center position (90 degrees)
        let targetY;
        if (sliderSticky && sliderOrigin !== null) {
            targetY = sliderOrigin;
        } else {
            // Calculate Y position for value 90 (exact middle)
            // value = ((maxY - y) / (maxY - minY)) * 180
            // 90 = ((maxY - y) / (maxY - minY)) * 180
            // 90 / 180 = (maxY - y) / (maxY - minY)
            // 0.5 = (maxY - y) / (maxY - minY)
            // y = maxY - 0.5 * (maxY - minY)
            targetY = maxY - 0.5 * (maxY - minY);
        }
        
        sliderThumb.style.top = targetY + 'px';
        
        const value = Math.round(((maxY - targetY) / (maxY - minY)) * 180);
        sliderValue.textContent = value;
        currentValues.servo1 = value;
    }

    sliderThumb.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (sliderTouchId === null) {
            sliderTouchId = e.changedTouches[0].identifier;
            if (!sliderSticky) {
                const rect = sliderContainer.getBoundingClientRect();
                const thumbRect = sliderThumb.getBoundingClientRect();
                sliderOrigin = thumbRect.top + thumbRect.height / 2 - rect.top;
            }
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (sliderTouchId !== null) {
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === sliderTouchId) {
                    e.preventDefault();
                    updateSlider(e.touches[i].clientY);
                    break;
                }
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (sliderTouchId !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === sliderTouchId) {
                    sliderTouchId = null;
                    if (!sliderSticky) {
                        resetSlider();
                    }
                    break;
                }
            }
        }
    });

    document.addEventListener('touchcancel', (e) => {
        if (sliderTouchId !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === sliderTouchId) {
                    sliderTouchId = null;
                    if (!sliderSticky) {
                        resetSlider();
                    }
                    break;
                }
            }
        }
    });

    // Mouse support for slider
    sliderThumb.addEventListener('mousedown', (e) => {
        if (sliderTouchId === null) {
            sliderMouseActive = true;
            if (!sliderSticky) {
                const rect = sliderContainer.getBoundingClientRect();
                const thumbRect = sliderThumb.getBoundingClientRect();
                sliderOrigin = thumbRect.top + thumbRect.height / 2 - rect.top;
            }
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (sliderMouseActive) {
            updateSlider(e.clientY);
        }
    });

    document.addEventListener('mouseup', () => {
        if (sliderMouseActive) {
            sliderMouseActive = false;
            if (!sliderSticky) {
                resetSlider();
            }
        }
    });

    // Initialize slider at 90 (middle) - don't set origin, let resetSlider calculate it
    sliderOrigin = null;
    resetSlider();

    // Joystick Logic
    const joystickContainer = document.getElementById('joystickContainer');
    const joystickStick = document.getElementById('joystickStick');
    const joystickValues = document.getElementById('joystickValues');
    const joystickToggle = document.getElementById('joystickToggle');
    
    let joystickSticky = false;
    let joystickTouchId = null;
    let joystickOriginX = 0;
    let joystickOriginY = 0;
    let joystickMouseActive = false;

    function toggleJoystickSticky() {
        joystickSticky = !joystickSticky;
        joystickToggle.classList.toggle('active');
        
        // When turning sticky ON while actively dragging, save current position as origin
        if (joystickSticky && (joystickTouchId !== null || joystickMouseActive)) {
            const rect = joystickContainer.getBoundingClientRect();
            const stickRect = joystickStick.getBoundingClientRect();
            joystickOriginX = stickRect.left + stickRect.width / 2 - rect.left;
            joystickOriginY = stickRect.top + stickRect.height / 2 - rect.top;
        } 
        // When turning sticky OFF, clear the origins so it resets to center
        else if (!joystickSticky) {
            joystickOriginX = null;
            joystickOriginY = null;
        }
    }

    joystickToggle.addEventListener('click', toggleJoystickSticky);
    joystickToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    joystickToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleJoystickSticky();
    });

    function updateJoystick(clientX, clientY) {
        // Stop autonomous/playback if user takes manual control
        if (autonomousMode) {
            stopAutonomousMode();
            autonomousBtn.classList.remove('autonomous');
            autonomousBtn.textContent = '🎃 Spooky Mode';
        }
        if (isPlaying) {
            stopPlayback();
            playBtn.textContent = '▶️ Play';
        }
        
        const rect = joystickContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        // Constrain to circle
        const maxRadius = 60;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > maxRadius) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * maxRadius;
            deltaY = Math.sin(angle) * maxRadius;
        }
        
        joystickStick.style.left = (100 + deltaX) + 'px';
        joystickStick.style.top = (100 + deltaY) + 'px';
        
        // Calculate normalized values (-100 to 100)
        const x = Math.round((deltaX / maxRadius) * 100);
        const y = Math.round((-deltaY / maxRadius) * 100);
        
        // Transform to servo values
        const servos = transformJoystick(x, y);
        currentValues.servo2 = servos.left;
        currentValues.servo3 = servos.right;
        
        joystickValues.innerHTML = `L: ${servos.left}<br>R: ${servos.right}`;
    }

    function resetJoystick() {
        // If sticky mode is on and we have an origin, use it
        // Otherwise, always reset to center (90/90)
        let targetX, targetY;
        
        if (joystickSticky && joystickOriginX && joystickOriginY) {
            targetX = joystickOriginX;
            targetY = joystickOriginY;
        } else {
            // Reset to absolute center
            targetX = 100; // Center of 200px container
            targetY = 100;
        }
        
        joystickStick.style.left = targetX + 'px';
        joystickStick.style.top = targetY + 'px';
        
        // Calculate servo values from position
        const centerX = 100;
        const centerY = 100;
        const deltaX = targetX - centerX;
        const deltaY = targetY - centerY;
        const maxRadius = 60;
        
        const x = Math.round((deltaX / maxRadius) * 100);
        const y = Math.round((-deltaY / maxRadius) * 100);
        
        const servos = transformJoystick(x, y);
        currentValues.servo2 = servos.left;
        currentValues.servo3 = servos.right;
        
        joystickValues.innerHTML = `L: ${servos.left}<br>R: ${servos.right}`;
    }

    joystickStick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (joystickTouchId === null) {
            joystickTouchId = e.changedTouches[0].identifier;
            if (!joystickSticky) {
                const rect = joystickContainer.getBoundingClientRect();
                const stickRect = joystickStick.getBoundingClientRect();
                joystickOriginX = stickRect.left + stickRect.width / 2 - rect.left;
                joystickOriginY = stickRect.top + stickRect.height / 2 - rect.top;
            }
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (joystickTouchId !== null) {
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === joystickTouchId) {
                    e.preventDefault();
                    updateJoystick(e.touches[i].clientX, e.touches[i].clientY);
                    break;
                }
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (joystickTouchId !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === joystickTouchId) {
                    joystickTouchId = null;
                    if (!joystickSticky) {
                        resetJoystick();
                    }
                    break;
                }
            }
        }
    });

    document.addEventListener('touchcancel', (e) => {
        if (joystickTouchId !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === joystickTouchId) {
                    joystickTouchId = null;
                    if (!joystickSticky) {
                        resetJoystick();
                    }
                    break;
                }
            }
        }
    });

    // Mouse support for joystick
    joystickStick.addEventListener('mousedown', (e) => {
        if (joystickTouchId === null) {
            joystickMouseActive = true;
            if (!joystickSticky) {
                const rect = joystickContainer.getBoundingClientRect();
                const stickRect = joystickStick.getBoundingClientRect();
                joystickOriginX = stickRect.left + stickRect.width / 2 - rect.left;
                joystickOriginY = stickRect.top + stickRect.height / 2 - rect.top;
            }
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (joystickMouseActive) {
            updateJoystick(e.clientX, e.clientY);
        }
    });

    document.addEventListener('mouseup', () => {
        if (joystickMouseActive) {
            joystickMouseActive = false;
            if (!joystickSticky) {
                resetJoystick();
            }
        }
    });

    // Initialize joystick at center (90/90) - don't set origins, let resetJoystick calculate them
    joystickOriginX = null;
    joystickOriginY = null;
    resetJoystick();

    // Start the update loop
    startUpdates();

    // Initial connection test
    sendUpdate();

})();
