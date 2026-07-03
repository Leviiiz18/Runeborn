const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Global State ---
let charactersData = {};
let animConfig = {};
let images = {};
let imageLoaded = false;
let gameRunning = false;

// Entities
let entities = [];
let player;
let dummy;

let GROUND_Y = window.innerHeight - 250;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    GROUND_Y = canvas.height - 250;
    
    // Update ground levels of active entities
    if (entities && entities.length > 0) {
        entities.forEach(ent => ent.groundLevel = GROUND_Y);
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Variables moved to the top of the file

// --- Input Handling ---
const keys = {
    left: false, right: false, up: false,
    attack: false, attack2: false, attack3: false,
    special: false, defend: false, roll: false,
    ctrl: false, trap: false
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
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.roll = true;
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') keys.ctrl = true;
    if (e.code === 'KeyT') keys.trap = true;
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
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.roll = false;
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') keys.ctrl = false;
    if (e.code === 'KeyT') keys.trap = false;
});

// --- Boot & Character Select ---
fetch('characters.json')
    .then(res => res.json())
    .then(data => {
        charactersData = data;
        const charList = document.getElementById('charList');
        charList.innerHTML = '';

        for (let charKey in data) {
            let btn = document.createElement('button');
            btn.className = 'char-btn';
            
            let niceName = charKey.replace('Elementals_', '').replace('elementals_', '').replace(/_FREE.*/i, '').replace(/_Free.*/i, '').replace(/_/g, ' ').trim();
            niceName = niceName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            btn.innerText = niceName;
            btn.onclick = () => selectCharacter(charKey);
            charList.appendChild(btn);
        }

        // --- Auto-start integration from React ---
        const urlParams = new URLSearchParams(window.location.search);
        const urlChar = urlParams.get('char');
        const urlArena = urlParams.get('arena');
        const urlDiff = urlParams.get('diff') || 'MEDIUM';
        const urlController = urlParams.get('controller');

        if (urlChar && urlArena) {
            window.selectedCharacter = urlChar;
            window.botDifficulty = urlDiff;
            animConfig = charactersData[urlChar].anims;
            
            // Show Game Container directly, hide others by removing 'active' classes
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
            document.getElementById('gameContainer').classList.add('active');
            
            // Toggle controller button visibility
            if (urlController === 'keyboard') {
                document.getElementById('connectBtn').style.display = 'none';
            } else {
                document.getElementById('connectBtn').style.display = 'block';
            }
            
            // Set Arena
            let videoEl = document.getElementById('bgVideo');
            let canvasEl = document.getElementById('gameCanvas');
            
            if (urlArena.endsWith('.mp4') || urlArena.endsWith('.webm')) {
                videoEl.src = urlArena;
                videoEl.style.display = 'block';
                canvasEl.style.backgroundImage = 'none';
                videoEl.play().catch(e => console.log('Video play error:', e));
            } else {
                videoEl.style.display = 'none';
                videoEl.src = '';
                canvasEl.style.backgroundImage = `url('${urlArena}')`;
            }

            loadCharacterAssets(urlChar);
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById('charList').innerHTML = '<p style="color:red">Failed to load characters.json</p>';
    });

function selectCharacter(charKey) {
    window.selectedCharacter = charKey;
    animConfig = charactersData[charKey].anims;
    showScreen('arena-select');
}

function loadCharacterAssets(charKey) {
    images = {};
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
            let fileName = conf.template ? conf.template.replace('{i}', i) : `${conf.prefix}_${i}.png`;
            img.src = `${conf.path}/${fileName}`;
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    imageLoaded = true;
                    if (!gameRunning) {
                        startGame();
                    }
                }
            };
            img.onerror = () => console.error("Failed to load image:", img.src);
            images[key].push(img);
        }
    }
}

function startGame() {
    entities = [];
    player = new Player(150, GROUND_Y);
    dummy = new Dummy(canvas.width - 250, GROUND_Y);
    entities.push(player);
    entities.push(dummy);
    
    gameRunning = true;
    gameLoop();
}

// --- Entity Classes ---
class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.5;
        this.groundLevel = GROUND_Y;
        this.facingRight = true;
        this.state = 'idle';
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 6;
        this.frameWidth = 288;
        this.frameHeight = 128;
        this.scale = 5;
        this.active = true;
        this.health = 500;
        this.maxHealth = 500;
        this.isDead = false;
        this.showHealth = false;
    }

    update() {}

    updateAnimation() {
        if (!imageLoaded) return;
        this.tickCount++;
        
        let currentTicksPerFrame = this.ticksPerFrame;
        if (this.state === 'roll') currentTicksPerFrame *= 2;
        
        if (this.tickCount > currentTicksPerFrame) {
            this.tickCount = 0;
            this.frameIndex++;
            
            let animData = animConfig[this.state];
            let numFrames = animData ? animData.count : 1;
            
            if (this.frameIndex >= numFrames) {
                this.onAnimationEnd();
                if (this.active) {
                    // Hold last frame for death and landing states, otherwise loop
                    if (this.isDead || ['jump_up', 'jump_down', 'defend', 'projectile_land', 'trap_land', 'death'].includes(this.state)) {
                        this.frameIndex = numFrames - 1;
                    } else {
                        this.frameIndex = 0;
                    }
                }
            }
        }
    }

    onAnimationEnd() {}

    draw(ctx) {
        if (!imageLoaded || !this.active) return;
        
        let stateImages = images[this.state];
        if (!stateImages || stateImages.length === 0) return;

        let safeIndex = Math.min(this.frameIndex, stateImages.length - 1);
        let img = stateImages[safeIndex];
        
        let drawWidth = this.frameWidth * this.scale;
        let drawHeight = this.frameHeight * this.scale;
        let drawX = this.x - drawWidth / 2;
        let drawY = this.y - drawHeight + 70;

        ctx.save();
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            drawX = -drawX - drawWidth;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y);
        this.speed = 5;
        this.jumpPower = -20;
        this.isAttacking = false;
        this.isDefending = false;
        this.isRolling = false;
        this.canRoll = true;
        this.isCasting = false;
        this.canCast = true;
        this.showHealth = true;
        this.attackHitboxActive = false;
        this.input = keys; // default to global keys
    }

    update() {
        if (!imageLoaded || this.isDead) return;

        // Melee collision check (from opponent)
        let opponent = this === player ? dummy : player;
        if (opponent && !opponent.isDead && opponent.isAttacking && opponent.hitFrames) {
            if (opponent.hitFrames.includes(opponent.frameIndex)) {
                let dist = Math.abs(this.x - opponent.x);
                let facingCorrectly = opponent.facingRight ? (this.x > opponent.x) : (this.x < opponent.x);
                if (dist < 400 && facingCorrectly) {
                    this.takeDamage(10);
                    opponent.hitFrames = opponent.hitFrames.filter(f => f !== opponent.frameIndex);
                }
            }
        }
        
        if (!this.isAttacking && !this.isDefending && !this.isRolling && !this.isCasting) {
            if (this.input.left) {
                this.vx = -this.speed;
                this.facingRight = false;
            } else if (this.input.right) {
                this.vx = this.speed;
                this.facingRight = true;
            } else {
                this.vx = 0;
            }

            if (this.input.up && this.y >= this.groundLevel) {
                this.vy = this.jumpPower;
            }
            
            if (this.y >= this.groundLevel) {
                if (this.input.attack && animConfig.attack) this.triggerAction('attack');
                else if (this.input.attack2 && animConfig.attack2) this.triggerAction('attack2');
                else if (this.input.attack3 && animConfig.attack3) this.triggerAction('attack3');
                else if (this.input.special && animConfig.special) this.triggerAction('special');
                else if (this.input.ctrl && animConfig.projectile_throw && this.canCast) {
                    this.canCast = false;
                    if (animConfig.projectile_cast) {
                        this.isCasting = true;
                        this.currentCastState = 'projectile_cast';
                        this.frameIndex = 0;
                        this.vx = 0;
                    } else {
                        // Spawn projectile immediately
                        entities.push(new Projectile(this.x, this.y, this.facingRight));
                    }
                }
                else if (this.input.trap && animConfig.trap_throw && this.canCast) {
                    this.canCast = false;
                    if (animConfig.trap_cast) {
                        this.isCasting = true;
                        this.currentCastState = 'trap_cast';
                        this.frameIndex = 0;
                        this.vx = 0;
                    } else {
                        entities.push(new Trap(this.x, this.y, this.facingRight, this));
                    }
                }
                else if (this.input.roll && animConfig.roll && this.canRoll) {
                    this.isRolling = true;
                    this.canRoll = false;
                    this.frameIndex = 0;
                    if (this.input.left) { this.facingRight = false; this.vx = -this.speed; }
                    else if (this.input.right) { this.facingRight = true; this.vx = this.speed; }
                    else { this.vx = this.facingRight ? this.speed : -this.speed; }
                } else if (this.input.defend && animConfig.defend) {
                    this.isDefending = true;
                    this.vx = 0;
                } else {
                    this.isDefending = false;
                }
            } else {
                if (this.input.attack && animConfig.air_atk) this.triggerAction('air_atk');
            }
        } else if (this.isDefending && !this.input.defend) {
            this.isDefending = false;
        }
        
        if (!this.input.roll) this.canRoll = true;
        if (!this.input.ctrl && !this.input.trap) this.canCast = true;

        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;

        if (this.y >= this.groundLevel) {
            this.y = this.groundLevel;
            this.vy = 0;
        }

        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;

        let nextState = 'idle';
        if (this.isCasting) {
            nextState = this.currentCastState;
        } else if (this.isRolling) {
            nextState = 'roll';
        } else if (this.isAttacking) {
            nextState = this.currentAttackState;
        } else if (this.isDefending) {
            nextState = 'defend';
        } else if (this.y < this.groundLevel) {
            if (this.vy < 0 && animConfig.jump_up) nextState = 'jump_up';
            else if (animConfig.jump_down) nextState = 'jump_down';
        } else if (this.vx !== 0 && animConfig.run) {
            nextState = 'run';
        }
        
        if (!animConfig[nextState]) nextState = 'idle';

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
        this.vx = 0;
        
        let numHits = 1;
        if (attackState === 'attack2') numHits = 2;
        if (attackState === 'attack3') numHits = 3;
        
        this.hitFrames = [];
        let totalFrames = animConfig[attackState].count;
        for (let i = 1; i <= numHits; i++) {
            this.hitFrames.push(Math.floor(totalFrames * (i / (numHits + 1))));
        }
    }

    onAnimationEnd() {
        if (this.isRolling) {
            this.isRolling = false;
            this.vx = 0;
        } else if (this.isAttacking) {
            this.isAttacking = false;
            this.hitFrames = [];
        } else if (this.isCasting) {
            this.isCasting = false;
            // Spawn the object at the end of the cast animation
            if (this.state === 'projectile_cast') {
                entities.push(new Projectile(this.x, this.y, this.facingRight, this));
            } else if (this.state === 'trap_cast') {
                entities.push(new Trap(this.x, this.y, this.facingRight, this));
            }
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;
        
        if (this.isDefending) {
            amount = Math.floor(amount / 4);
            this.x += this.facingRight ? -10 : 10;
        } else if (this.isRolling) {
            return; // i-frames
        }

        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            if (animConfig.death) {
                this.state = 'death';
                this.frameIndex = 0;
            }
            
            setTimeout(() => {
                let vic = document.createElement('div');
                vic.innerText = this === player ? "DEFEAT" : "VICTORY!!";
                vic.style.position = 'absolute';
                vic.style.top = '40%';
                vic.style.left = '50%';
                vic.style.transform = 'translate(-50%, -50%)';
                vic.style.fontSize = '80px';
                vic.style.color = this === player ? '#B33939' : '#FFD700';
                vic.style.fontWeight = 'bold';
                vic.style.textShadow = '4px 4px 10px rgba(0,0,0,0.8)';
                vic.style.pointerEvents = 'none';
                vic.style.zIndex = '1000';
                document.body.appendChild(vic);
            }, 1000);

        } else if (animConfig.take_hit && !this.isDefending) {
            this.state = 'take_hit';
            this.frameIndex = 0;
            this.isAttacking = false;
            this.isCasting = false;
        }
    }
}

class Dummy extends Player {
    constructor(x, y) {
        super(x, y);
        this.facingRight = false;
        this.input = {
            left: false, right: false, up: false,
            attack: false, attack2: false, attack3: false,
            special: false, defend: false, roll: false,
            ctrl: false, trap: false
        };
        this.aiTimer = 0;
    }
    
    update() {
        if (this.isDead || !imageLoaded || !gameRunning) {
            super.update();
            return;
        }
        this.aiDecisionTick();
        super.update();
    }
    
    aiDecisionTick() {
        this.aiTimer++;
        if (this.aiTimer < 10) return;
        this.aiTimer = 0;
        
        for (let k in this.input) this.input[k] = false;
        
        if (player.isDead) return;

        let dist = Math.abs(this.x - player.x);
        let facingPlayer = (player.x > this.x);
        this.input[facingPlayer ? 'right' : 'left'] = true;
        
        let diff = window.botDifficulty || 'MEDIUM';
        let diffMult = diff === 'HARD' ? 3 : (diff === 'MEDIUM' ? 1.5 : 0.5);
        
        if (player.isAttacking || player.isCasting) {
            if (Math.random() < 0.2 * diffMult) {
                if (dist < 400 && this.canRoll) this.input.roll = true;
                else this.input.defend = true;
                return;
            }
        }
        
        if (dist < 350) {
            this.input[facingPlayer ? 'right' : 'left'] = false;
            if (Math.random() < 0.5 * diffMult) {
                let attacks = ['attack', 'attack2'];
                if (diff === 'HARD') attacks.push('attack3', 'special');
                this.input[attacks[Math.floor(Math.random() * attacks.length)]] = true;
            }
        } else if (dist > 600) {
            if (this.canCast && Math.random() < 0.1 * diffMult) {
                if (Math.random() > 0.5) this.input.ctrl = true;
                else this.input.trap = true;
            }
        }
    }
}

class Projectile extends Entity {
    constructor(x, y, facingRight, owner) {
        super(x, y - 50); // Offset to shoot from chest/hand level
        this.facingRight = facingRight;
        this.owner = owner;
        this.state = 'projectile_throw';
        this.vx = facingRight ? 20 : -20;
        this.gravity = 0; // Flies straight
        this.hitDummy = false;
    }

    update() {
        this.x += this.vx;
        
        let target = this.owner === player ? dummy : player;
        if (!this.hitDummy && this.state === 'projectile_throw') {
            if (target && !target.isDead && Math.abs(this.x - target.x) < 125 && Math.abs(this.y - target.y) < 250) {
                this.hitDummy = true;
                this.vx = 0;
                target.takeDamage(50);
                if (animConfig.projectile_land) {
                    this.state = 'projectile_land';
                    this.frameIndex = 0;
                } else {
                    this.active = false;
                }
            }
        }
        
        if (this.x < -100 || this.x > canvas.width + 100) {
            this.active = false;
        }

        this.updateAnimation();
    }
    
    onAnimationEnd() {
        if (this.state === 'projectile_land') {
            this.active = false;
        }
    }
}

class Trap extends Entity {
    constructor(x, y, facingRight, owner) {
        super(x, y - 30);
        this.facingRight = facingRight;
        this.owner = owner;
        this.state = 'trap_throw';
        this.vx = facingRight ? 15 : -15;
        this.vy = -15; // Toss upwards
        this.gravity = 0.5;
        this.isLanded = false;
        this.isDetonating = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;

        if (this.y >= this.groundLevel) {
            this.y = this.groundLevel;
            this.vy = 0;
            this.vx = 0;
            if (!this.isLanded) {
                this.isLanded = true;
                if (animConfig.trap_land) {
                    this.state = 'trap_land';
                    this.frameIndex = 0;
                }
            }
        }

        if (this.isLanded && !this.isDetonating) {
            let target = this.owner === player ? dummy : player;
            if (target && !target.isDead && Math.abs(this.x - target.x) < 150) {
                this.isDetonating = true;
                target.takeDamage(50);
                if (animConfig.trap_detonate) {
                    this.state = 'trap_detonate';
                    this.frameIndex = 0;
                } else {
                    this.active = false;
                }
            }
        }

        this.updateAnimation();
    }

    onAnimationEnd() {
        if (this.state === 'trap_detonate') {
            this.active = false;
        }
    }
}

// --- Game Loop ---
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Darken background so characters stand out
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    let matchEnded = false;

    for (let i = entities.length - 1; i >= 0; i--) {
        let ent = entities[i];
        if (ent.active) {
            ent.update();
            ent.draw(ctx);
        } else {
            entities.splice(i, 1);
        }
        if (ent.isDead) matchEnded = true;
    }
    
    if (matchEnded) {
        let bgVideo = document.getElementById('bgVideo');
        if (bgVideo && !bgVideo.paused) {
            bgVideo.pause();
        }
    }
    
    updateDOM_UI();

    requestAnimationFrame(gameLoop);
}

function updateDOM_UI() {
    // Health Bars
    let pPercent = Math.max(0, player.health / player.maxHealth) * 100;
    document.getElementById('playerHealthFill').style.width = pPercent + '%';

    let dPercent = Math.max(0, dummy.health / dummy.maxHealth) * 100;
    document.getElementById('dummyHealthFill').style.width = dPercent + '%';

    // Skill Highlights
    document.getElementById('ui-atk1').classList.toggle('active', keys.attack);
    document.getElementById('ui-atk2').classList.toggle('active', keys.attack2);
    document.getElementById('ui-atk3').classList.toggle('active', keys.attack3);
    document.getElementById('ui-roll').classList.toggle('active', keys.roll);
    
    document.getElementById('ui-proj').classList.toggle('active', keys.ctrl);
    document.getElementById('ui-trap').classList.toggle('active', keys.trap);
    document.getElementById('ui-spec').classList.toggle('active', keys.special);
    document.getElementById('ui-def').classList.toggle('active', keys.defend);
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
            buffer = lines.pop(); 
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
        if (direction === 'CLOCKWISE' || direction === 'COUNTER-CLOCKWISE') keys.attack = true;
    }
}
