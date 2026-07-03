const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Global State ---
let charactersData = {};
let animConfig = {};
let images = {};
let imageLoaded = false;
let gameRunning = false;

// --- Input Handling ---
const keys = {
    left: false, right: false, up: false,
    attack: false, attack2: false, attack3: false,
    special: false, defend: false
};

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keys.up = true;
    if (e.code === 'KeyF') keys.attack = true;
    if (e.code === 'KeyG') keys.attack2 = true;
    if (e.code === 'KeyH') keys.attack3 = true;
    if (e.code === 'KeyX') keys.special = true;
    if (e.code === 'KeyC') keys.defend = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keys.up = false;
    if (e.code === 'KeyF') keys.attack = false;
    if (e.code === 'KeyG') keys.attack2 = false;
    if (e.code === 'KeyH') keys.attack3 = false;
    if (e.code === 'KeyX') keys.special = false;
    if (e.code === 'KeyC') keys.defend = false;
});

// --- Boot & Character Select ---
fetch('characters.json')
    .then(res => res.json())
    .then(data => {
        charactersData = data;
        const charList = document.getElementById('charList');
        charList.innerHTML = ''; // clear loading text

        for (let charKey in data) {
            let btn = document.createElement('button');
            btn.className = 'char-btn';
            
            // Make a prettier name
            let niceName = charKey
                .replace('Elementals_', '')
                .replace('elementals_', '')
                .replace(/_FREE.*/i, '')
                .replace(/_Free.*/i, '')
                .replace(/_/g, ' ')
                .trim();
            
            // Capitalize
            niceName = niceName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            btn.innerText = niceName;
            btn.onclick = () => selectCharacter(charKey);
            charList.appendChild(btn);
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById('charList').innerHTML = '<p style="color:red">Failed to load characters.json</p>';
    });

function selectCharacter(charKey) {
    document.getElementById('charSelectMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    
    animConfig = charactersData[charKey].anims;
    loadCharacterAssets(charKey);
}

function loadCharacterAssets(charKey) {
    images = {}; // Reset images
    let imagesLoaded = 0;
    let totalImages = 0;

    for (let key in animConfig) {
        totalImages += animConfig[key].count;
        images[key] = [];
    }

    for (let key in animConfig) {
        let conf = animConfig[key];
        for (let i = 1; i <= conf.count; i++) {
            let img = new Image();
            img.src = `${conf.path}/${conf.prefix}_${i}.png`;
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    imageLoaded = true;
                    if (!gameRunning) {
                        gameRunning = true;
                        gameLoop();
                    }
                }
            };
            img.onerror = () => {
                console.error("Failed to load image:", img.src);
            };
            images[key].push(img);
        }
    }
}

// --- Player Class ---
class Player {
    constructor() {
        this.x = 100;
        this.y = 300;
        this.vx = 0;
        this.vy = 0;
        this.speed = 3;
        this.jumpPower = -12;
        this.gravity = 0.5;
        this.groundLevel = 300;
        
        this.state = 'idle';
        this.facingRight = true;
        
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 4;
        
        // Action locks
        this.isAttacking = false;
        this.isDefending = false;
        
        this.frameWidth = 288;
        this.frameHeight = 128;
    }

    update() {
        if (!imageLoaded) return;
        
        // Horizontal Movement
        if (!this.isAttacking && !this.isDefending) {
            if (keys.left) {
                this.vx = -this.speed;
                this.facingRight = false;
            } else if (keys.right) {
                this.vx = this.speed;
                this.facingRight = true;
            } else {
                this.vx = 0;
            }

            // Jumping
            if (keys.up && this.y >= this.groundLevel) {
                this.vy = this.jumpPower;
            }
            
            // Actions when grounded
            if (this.y >= this.groundLevel) {
                if (keys.attack && animConfig.attack) {
                    this.triggerAction('attack');
                } else if (keys.attack2 && animConfig.attack2) {
                    this.triggerAction('attack2');
                } else if (keys.attack3 && animConfig.attack3) {
                    this.triggerAction('attack3');
                } else if (keys.special && animConfig.special) {
                    this.triggerAction('special');
                } else if (keys.defend && animConfig.defend) {
                    this.isDefending = true;
                    this.vx = 0;
                } else {
                    this.isDefending = false; // release defend if key is released
                }
            } else {
                // Actions in air
                if (keys.attack && animConfig.air_atk) {
                    this.triggerAction('air_atk');
                }
            }
        } else if (this.isDefending) {
            if (!keys.defend) {
                this.isDefending = false;
            }
        }

        // Apply physics
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;

        // Floor collision
        if (this.y >= this.groundLevel) {
            this.y = this.groundLevel;
            this.vy = 0;
        }

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;

        // State Machine
        let nextState = 'idle';
        if (this.isAttacking) {
            nextState = this.currentAttackState;
        } else if (this.isDefending) {
            nextState = 'defend';
        } else if (this.y < this.groundLevel) {
            if (this.vy < 0 && animConfig.jump_up) {
                nextState = 'jump_up';
            } else if (animConfig.jump_down) {
                nextState = 'jump_down';
            } else if (animConfig.jump) {
                nextState = 'jump'; // Fallback for some packs
            }
        } else if (this.vx !== 0 && animConfig.run) {
            nextState = 'run';
        } else {
            nextState = 'idle';
        }
        
        // Fallback to idle if a state is missing (e.g. some characters don't have run or jump)
        if (!animConfig[nextState]) {
            nextState = 'idle';
        }

        if (this.state !== nextState) {
            this.state = nextState;
            this.frameIndex = 0;
        }

        this.updateAnimation();
    }

    triggerAction(attackState) {
        this.isAttacking = true;
        this.currentAttackState = attackState;
        this.frameIndex = 0;
        this.vx = 0; // stop moving while attacking
    }

    updateAnimation() {
        if (!imageLoaded) return;
        
        this.tickCount++;
        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            this.frameIndex++;
            
            let animData = animConfig[this.state];
            let numFrames = animData ? animData.count : 1;
            
            if (this.frameIndex >= numFrames) {
                if (this.isAttacking) {
                    this.isAttacking = false;
                    this.frameIndex = 0;
                } else if (this.state === 'jump_up' || this.state === 'jump_down') {
                    // Hold the last frame of the up/down phase while in the air
                    this.frameIndex = numFrames - 1; 
                } else if (this.state === 'defend') {
                    // Hold the last frame of defend (shield up) as long as key is held
                    this.frameIndex = numFrames - 1;
                } else {
                    this.frameIndex = 0; // Loop animation
                }
            }
        }
    }

    draw(ctx) {
        if (!imageLoaded) return;
        
        let stateImages = images[this.state];
        if (!stateImages || stateImages.length === 0) return;

        let safeIndex = Math.min(this.frameIndex, stateImages.length - 1);
        let img = stateImages[safeIndex];
        
        let scale = 2; // Scale up the sprite
        let drawWidth = this.frameWidth * scale;
        let drawHeight = this.frameHeight * scale;
        
        // Centering
        let drawX = this.x - drawWidth / 2;
        let drawY = this.y - drawHeight + 70; // Offset to align feet with ground

        ctx.save();
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            drawX = -drawX - drawWidth;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    }
}

const player = new Player();

// --- Game Loop ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground line
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, player.groundLevel + 70);
    ctx.lineTo(canvas.width, player.groundLevel + 70);
    ctx.stroke();

    player.update();
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

// --- Web Serial API for Gyro ---
const connectBtn = document.getElementById('connectBtn');
let port;
let reader;
let inputDone;
let inputStream;

if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 115200 });
            connectBtn.innerText = "Gyro Connected!";
            connectBtn.style.backgroundColor = "#00cc66";

            const decoder = new TextDecoderStream();
            inputDone = port.readable.pipeTo(decoder.writable);
            inputStream = decoder.readable;

            reader = inputStream.getReader();
            readLoop();
        } catch (e) {
            console.error("Error connecting to serial port:", e);
            alert("Could not connect to the Arduino.");
        }
    });
}

async function readLoop() {
    let buffer = '';
    while (true) {
        const { value, done } = await reader.read();
        if (value) {
            buffer += value;
            let lines = buffer.split('\n');
            buffer = lines.pop(); // keep the incomplete line in the buffer
            for (let line of lines) {
                processLine(line);
            }
        }
        if (done) {
            reader.releaseLock();
            break;
        }
    }
}

function processLine(line) {
    if (line.includes('->')) {
        let direction = line.split('->')[1].trim();
        
        keys.left = false;
        keys.right = false;
        keys.up = false;
        keys.attack = false;

        if (direction === 'LEFT') keys.left = true;
        if (direction === 'RIGHT') keys.right = true;
        if (direction === 'UP') keys.up = true;
        
        if (direction === 'CLOCKWISE' || direction === 'COUNTER-CLOCKWISE') {
            keys.attack = true;
        }
    }
}
