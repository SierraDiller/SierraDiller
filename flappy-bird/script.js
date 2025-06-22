// Game Configuration
const GAME_CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    bird: {
        x: 150,
        y: 300,
        width: 40,
        height: 40,
        gravity: 0.6,
        flapForce: -9,
        maxVelocity: 12
    },
    pipe: {
        width: 80,
        gap: 250,
        speed: 1.5,
        spawnInterval: 5100
    },
    ground: {
        speed: 1.5,
        offset: 0
    },
    colors: {
        bird: '#FFD700',
        pipe: '#2E8B57',
        background: '#87CEEB',
        ground: '#90EE90',
        sky: '#98D8E8'
    }
};

// Game State
let gameState = {
    currentState: 'MENU', // MENU, PLAYING, GAME_OVER
    bird: {
        x: GAME_CONFIG.bird.x,
        y: GAME_CONFIG.bird.y,
        velocity: 0,
        rotation: 0,
        wingFlap: 0, // Wing flap animation state
        isFlapping: false, // Whether bird is currently flapping
        isAngel: false, // Angel state after death
        angelY: 0, // Angel floating position
        deathY: 0 // Y position where bird died
    },
    pipes: [],
    score: 0,
    highScore: 0,
    lastPipeSpawn: 0,
    audioEnabled: true,
    explosionAlpha: 0, // For explosion effect
    explosionParticles: [], // Particle system for explosion
    explosionTime: 0, // Time since explosion started
    explosionFrames: [] // Smooth explosion animation frames
};

// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Enable pixelated rendering
ctx.imageSmoothingEnabled = false;

// DOM Elements
const menuScreen = document.getElementById('menuScreen');
const gameUI = document.getElementById('gameUI');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const audioBtn = document.getElementById('audioBtn');
const currentScoreDisplay = document.getElementById('currentScore');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const finalScoreDisplay = document.getElementById('finalScore');
const finalHighScoreDisplay = document.getElementById('finalHighScore');

// Audio Elements
let flapSound, hitSound, scoreSound;

// Initialize the game
function init() {
    loadHighScore();
    setupEventListeners();
    setupAudio();
    resizeCanvas();
    gameLoop();
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    menuBtn.addEventListener('click', showMenu);
    audioBtn.addEventListener('click', toggleAudio);
    
    // Input handling
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', handleInput);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleInput();
        }
    });
    
    // Window resize
    window.addEventListener('resize', resizeCanvas);
}

// Setup audio
function setupAudio() {
    // Create simple audio using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Flap sound (simple beep)
    function createFlapSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    // Hit sound (lower frequency)
    function createHitSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    // Score sound (higher frequency)
    function createScoreSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    flapSound = createFlapSound;
    hitSound = createHitSound;
    scoreSound = createScoreSound;
}

// Resize canvas to fit screen
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scale = Math.min(containerWidth / GAME_CONFIG.canvas.width, containerHeight / GAME_CONFIG.canvas.height);
    
    canvas.style.width = `${GAME_CONFIG.canvas.width * scale}px`;
    canvas.style.height = `${GAME_CONFIG.canvas.height * scale}px`;
}

// Handle input (click, touch, spacebar)
function handleInput(e) {
    if (e) {
        e.preventDefault();
    }
    
    if (gameState.currentState === 'PLAYING') {
        flap();
    }
}

// Bird flap
function flap() {
    if (gameState.currentState !== 'PLAYING') return;
    
    gameState.bird.velocity = GAME_CONFIG.bird.flapForce;
    gameState.bird.isFlapping = true;
    gameState.bird.wingFlap = 0; // Start wing flap animation
    
    if (gameState.audioEnabled && flapSound) {
        flapSound();
    }
}

// Start game
function startGame() {
    gameState.currentState = 'PLAYING';
    gameState.bird.x = GAME_CONFIG.bird.x;
    gameState.bird.y = GAME_CONFIG.bird.y;
    gameState.bird.velocity = 0;
    gameState.bird.rotation = 0;
    gameState.bird.wingFlap = 0;
    gameState.bird.isFlapping = false;
    gameState.bird.isAngel = false; // Reset angel state
    gameState.bird.angelY = 0; // Reset angel position
    gameState.bird.deathY = 0; // Reset death position
    gameState.pipes = [];
    gameState.score = 0;
    gameState.lastPipeSpawn = Date.now();
    gameState.explosionAlpha = 0; // Reset explosion effect
    gameState.explosionParticles = []; // Reset particle system
    gameState.explosionTime = 0; // Reset explosion time
    gameState.explosionFrames = []; // Reset explosion frames
    
    // Spawn the first pipe immediately
    spawnPipe();
    
    updateScoreDisplay();
    showGameUI();
}

// Show menu
function showMenu() {
    gameState.currentState = 'MENU';
    showMenuScreen();
}

// Game over
function gameOver() {
    if (gameState.currentState !== 'PLAYING') return;
    
    gameState.currentState = 'GAME_OVER';
    gameState.explosionAlpha = 0; // Start explosion effect
    gameState.explosionParticles = []; // Reset particle system
    gameState.explosionTime = 0; // Reset explosion time
    gameState.explosionFrames = []; // Reset explosion frames
    
    // Set bird to angel state
    gameState.bird.isAngel = true;
    gameState.bird.angelY = 0;
    gameState.bird.deathY = gameState.bird.y;
    
    // Create explosion at bird's location
    createSmoothExplosion(gameState.bird.x + GAME_CONFIG.bird.width / 2, gameState.bird.y + GAME_CONFIG.bird.height / 2);
    
    if (gameState.audioEnabled && hitSound) {
        hitSound();
    }
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore();
    }
    
    showGameOverScreen();
}

// Update game logic
function update() {
    if (gameState.currentState !== 'PLAYING') {
        // Update explosion effect even when not playing
        if (gameState.currentState === 'GAME_OVER') {
            gameState.explosionTime++;
            if (gameState.explosionAlpha < 0.2) {
                gameState.explosionAlpha += 0.01; // Very subtle background
            }
            updateExplosionParticles();
            
            // Update angel bird floating
            if (gameState.bird.isAngel) {
                gameState.bird.angelY -= 2; // Float up faster
            }
        }
        return;
    }
    
    // Update bird physics
    updateBird();
    
    // Update pipes
    updatePipes();
    
    // Update ground (only when pipes move)
    updateGround();
    
    // Check collisions
    checkCollisions();
    
    // Update score
    updateScore();
}

// Update bird physics
function updateBird() {
    // Apply gravity
    gameState.bird.velocity += GAME_CONFIG.bird.gravity;
    
    // Limit velocity
    gameState.bird.velocity = Math.min(gameState.bird.velocity, GAME_CONFIG.bird.maxVelocity);
    
    // Update position
    gameState.bird.y += gameState.bird.velocity;
    
    // Update rotation based on velocity
    gameState.bird.rotation = Math.min(Math.max(gameState.bird.velocity * 3, -25), 90);
    
    // Update wing flap animation
    if (gameState.bird.isFlapping) {
        gameState.bird.wingFlap += 0.3;
        if (gameState.bird.wingFlap >= 1) {
            gameState.bird.isFlapping = false;
            gameState.bird.wingFlap = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    const now = Date.now();
    
    // Spawn new pipes
    if (now - gameState.lastPipeSpawn > GAME_CONFIG.pipe.spawnInterval) {
        spawnPipe();
        gameState.lastPipeSpawn = now;
    }
    
    // Move pipes and remove off-screen pipes
    gameState.pipes = gameState.pipes.filter(pipe => {
        pipe.x -= GAME_CONFIG.pipe.speed;
        return pipe.x > -GAME_CONFIG.pipe.width;
    });
}

// Spawn a new pipe
function spawnPipe() {
    const gapY = Math.random() * (GAME_CONFIG.canvas.height - GAME_CONFIG.pipe.gap - 100) + 50;
    
    gameState.pipes.push({
        x: GAME_CONFIG.canvas.width,
        gapY: gapY,
        passed: false
    });
}

// Update ground movement (only when pipes move)
function updateGround() {
    // Ground moves at the same speed as pipes - use continuous offset without reset
    gameState.groundOffset = (gameState.groundOffset || 0) + GAME_CONFIG.pipe.speed;
}

// Check collisions
function checkCollisions() {
    const bird = gameState.bird;
    
    // Check ground and ceiling collision
    if (bird.y <= 0 || bird.y + GAME_CONFIG.bird.height >= GAME_CONFIG.canvas.height) {
        gameOver();
        return;
    }
    
    // Check pipe collisions
    for (let pipe of gameState.pipes) {
        if (bird.x + GAME_CONFIG.bird.width > pipe.x && 
            bird.x < pipe.x + GAME_CONFIG.pipe.width) {
            
            if (bird.y < pipe.gapY || bird.y + GAME_CONFIG.bird.height > pipe.gapY + GAME_CONFIG.pipe.gap) {
                gameOver();
                return;
            }
        }
    }
}

// Update score
function updateScore() {
    for (let pipe of gameState.pipes) {
        if (!pipe.passed && gameState.bird.x > pipe.x + GAME_CONFIG.pipe.width) {
            pipe.passed = true;
            gameState.score++;
            
            if (gameState.audioEnabled && scoreSound) {
                scoreSound();
            }
            
            updateScoreDisplay();
        }
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
    
    // Draw background
    drawBackground();
    
    // Draw pipes
    drawPipes();
    
    // Draw bird
    drawBird();
    
    // Draw ground
    drawGround();
    
    // Draw explosion particles
    if (gameState.explosionParticles.length > 0) {
        drawExplosionParticles();
    }
    
    // Draw shockwave frames
    if (gameState.explosionFrames.length > 0) {
        drawShockwaveFrames();
    }
    
    // Draw explosion background effect
    if (gameState.explosionAlpha > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${gameState.explosionAlpha})`;
        ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
    }
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvas.height);
    gradient.addColorStop(0, GAME_CONFIG.colors.sky);
    gradient.addColorStop(0.7, GAME_CONFIG.colors.background);
    gradient.addColorStop(1, GAME_CONFIG.colors.ground);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
    
    // Simple clouds
    drawClouds();
}

// Draw clouds
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Cloud 1 - big detailed blocky design
    ctx.fillRect(60, 60, 25, 25);
    ctx.fillRect(85, 60, 25, 25);
    ctx.fillRect(110, 60, 25, 25);
    ctx.fillRect(135, 60, 25, 25);
    ctx.fillRect(85, 35, 25, 25);
    ctx.fillRect(110, 35, 25, 25);
    ctx.fillRect(135, 35, 25, 25);
    ctx.fillRect(110, 10, 25, 25);
    ctx.fillRect(135, 10, 25, 25);
    
    // Cloud 2 - big detailed blocky design
    ctx.fillRect(550, 40, 25, 25);
    ctx.fillRect(575, 40, 25, 25);
    ctx.fillRect(600, 40, 25, 25);
    ctx.fillRect(625, 40, 25, 25);
    ctx.fillRect(575, 15, 25, 25);
    ctx.fillRect(600, 15, 25, 25);
    ctx.fillRect(625, 15, 25, 25);
    ctx.fillRect(600, -10, 25, 25);
    ctx.fillRect(625, -10, 25, 25);
    
    // Cloud 3 - medium detailed cloud
    ctx.fillRect(280, 100, 20, 20);
    ctx.fillRect(300, 100, 20, 20);
    ctx.fillRect(320, 100, 20, 20);
    ctx.fillRect(300, 80, 20, 20);
    ctx.fillRect(320, 80, 20, 20);
    ctx.fillRect(300, 60, 20, 20);
    
    // Cloud 4 - large detailed cloud
    ctx.fillRect(420, 80, 25, 25);
    ctx.fillRect(445, 80, 25, 25);
    ctx.fillRect(470, 80, 25, 25);
    ctx.fillRect(495, 80, 25, 25);
    ctx.fillRect(445, 55, 25, 25);
    ctx.fillRect(470, 55, 25, 25);
    ctx.fillRect(495, 55, 25, 25);
    ctx.fillRect(470, 30, 25, 25);
    ctx.fillRect(495, 30, 25, 25);
    
    // Cloud 5 - medium detailed cloud
    ctx.fillRect(180, 70, 20, 20);
    ctx.fillRect(200, 70, 20, 20);
    ctx.fillRect(220, 70, 20, 20);
    ctx.fillRect(200, 50, 20, 20);
    ctx.fillRect(220, 50, 20, 20);
    
    // Cloud 6 - huge detailed cloud
    ctx.fillRect(620, 120, 30, 30);
    ctx.fillRect(650, 120, 30, 30);
    ctx.fillRect(680, 120, 30, 30);
    ctx.fillRect(710, 120, 30, 30);
    ctx.fillRect(650, 90, 30, 30);
    ctx.fillRect(680, 90, 30, 30);
    ctx.fillRect(710, 90, 30, 30);
    ctx.fillRect(680, 60, 30, 30);
    ctx.fillRect(710, 60, 30, 30);
    ctx.fillRect(680, 30, 30, 30);
    ctx.fillRect(710, 30, 30, 30);
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = GAME_CONFIG.colors.pipe;
    
    for (let pipe of gameState.pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, GAME_CONFIG.pipe.width, pipe.gapY);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + GAME_CONFIG.pipe.gap, 
                    GAME_CONFIG.pipe.width, GAME_CONFIG.canvas.height - pipe.gapY - GAME_CONFIG.pipe.gap);
        
        // Pipe caps with pixelated design
        ctx.fillRect(pipe.x - 8, pipe.gapY - 24, GAME_CONFIG.pipe.width + 16, 24);
        ctx.fillRect(pipe.x - 8, pipe.gapY + GAME_CONFIG.pipe.gap, GAME_CONFIG.pipe.width + 16, 24);
        
        // Pipe highlights (pixelated)
        ctx.fillStyle = '#3CB371';
        ctx.fillRect(pipe.x + 4, 0, 8, pipe.gapY);
        ctx.fillRect(pipe.x + 4, pipe.gapY + GAME_CONFIG.pipe.gap, 
                    8, GAME_CONFIG.canvas.height - pipe.gapY - GAME_CONFIG.pipe.gap);
        
        // Reset color
        ctx.fillStyle = GAME_CONFIG.colors.pipe;
    }
}

// Draw bird
function drawBird() {
    ctx.save();
    
    // Handle angel bird positioning
    if (gameState.bird.isAngel) {
        // Position bird to float from where it died to top of screen
        const startY = gameState.bird.deathY; // Start from where bird died
        const endY = 50; // Stop at top of screen
        const currentY = Math.max(endY, startY + gameState.bird.angelY); // Don't go above top
        ctx.translate(gameState.bird.x + GAME_CONFIG.bird.width / 2, currentY);
        ctx.rotate(0); // No rotation for angel
    } else {
        ctx.translate(gameState.bird.x + GAME_CONFIG.bird.width / 2, gameState.bird.y + GAME_CONFIG.bird.height / 2);
        ctx.rotate(gameState.bird.rotation * Math.PI / 180);
    }
    
    // Calculate constant wing flap animation
    const wingFlapOffset = Math.sin(Date.now() * 0.01) * 4;
    
    // Bird body (rounder - using pixelated ovals with black outline)
    const radiusX = GAME_CONFIG.bird.width / 2 + 4; // Even bigger horizontal radius
    const radiusY = GAME_CONFIG.bird.height / 2; // Back to original for more oval shape
    const centerX = 0;
    const centerY = 0;
    const pixelSize = 4; // Smaller pixels for smoother circle
    
    // Draw bird body with black outline pixels
    for (let x = -radiusX; x <= radiusX; x += pixelSize) {
        for (let y = -radiusY; y <= radiusY; y += pixelSize) {
            const normalizedX = x / radiusX;
            const normalizedY = y / radiusY;
            const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            if (distance <= 1) {
                // Check if this is an outline pixel (near the edge)
                const outlineDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
                if (outlineDistance > 0.8 && outlineDistance <= 1) { // Adjusted for better top/bottom outline
                    ctx.fillStyle = '#000'; // Black outline
                } else {
                    ctx.fillStyle = GAME_CONFIG.colors.bird; // Yellow body
                }
                ctx.fillRect(centerX + x, centerY + y, pixelSize, pixelSize);
            }
        }
    }
    
    // Cute big eye with white background and black pupil
    // Single eye - bigger with black outline
    ctx.fillStyle = '#000'; // Black outline
    ctx.fillRect(GAME_CONFIG.bird.width / 4 - 7, -GAME_CONFIG.bird.height / 4 - 4, 14, 14);
    ctx.fillStyle = '#FFF'; // White background
    ctx.fillRect(GAME_CONFIG.bird.width / 4 - 6, -GAME_CONFIG.bird.height / 4 - 3, 12, 12);
    ctx.fillStyle = '#000'; // Black pupil
    ctx.fillRect(GAME_CONFIG.bird.width / 4 - 3, -GAME_CONFIG.bird.height / 4, 5, 5);
    
    // Draw X over eye if angel
    if (gameState.bird.isAngel) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(GAME_CONFIG.bird.width / 4 - 6, -GAME_CONFIG.bird.height / 4 - 3);
        ctx.lineTo(GAME_CONFIG.bird.width / 4 + 6, -GAME_CONFIG.bird.height / 4 + 9);
        ctx.moveTo(GAME_CONFIG.bird.width / 4 + 6, -GAME_CONFIG.bird.height / 4 - 3);
        ctx.lineTo(GAME_CONFIG.bird.width / 4 - 6, -GAME_CONFIG.bird.height / 4 + 9);
        ctx.stroke();
    }
    
    // Bird beak (pointing right) with black outline
    ctx.fillStyle = '#000'; // Black outline
    ctx.fillRect(GAME_CONFIG.bird.width / 2 - 2, -4, 12, 8);
    ctx.fillStyle = '#FF6B35'; // Orange beak
    ctx.fillRect(GAME_CONFIG.bird.width / 2, -3, 10, 6);
    
    // Wings that extend behind the bird - constantly flapping
    if (gameState.bird.isAngel) {
        // Giant white angel wings
        ctx.fillStyle = '#FFFFFF';
        
        // Left angel wing (giant) - horizontal
        ctx.beginPath();
        ctx.ellipse(-GAME_CONFIG.bird.width / 2 - 30, -GAME_CONFIG.bird.height / 4 + wingFlapOffset, 40, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Right angel wing (giant) - horizontal
        ctx.beginPath();
        ctx.ellipse(-GAME_CONFIG.bird.width / 2 - 30, GAME_CONFIG.bird.height / 4 - wingFlapOffset, 40, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing details (golden edges)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-GAME_CONFIG.bird.width / 2 - 30, -GAME_CONFIG.bird.height / 4 + wingFlapOffset, 40, 25, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(-GAME_CONFIG.bird.width / 2 - 30, GAME_CONFIG.bird.height / 4 - wingFlapOffset, 40, 25, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Halo
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, -GAME_CONFIG.bird.height / 2 - 15, 25, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Halo glow
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(0, -GAME_CONFIG.bird.height / 2 - 15, 25, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Small oval wing (behind bird) - stretched horizontally with black outline
        const wingRadiusX = 12; // Smaller horizontally
        const wingRadiusY = 8; // Taller vertically
        const wingX = -GAME_CONFIG.bird.width / 2 + 2; // Overlay the bird more
        const wingY = 0 + wingFlapOffset; // Lower on the bird
        
        // Draw pixelated oval for wing with black outline
        for (let x = -wingRadiusX - 4; x <= wingRadiusX + 4; x += 2) {
            for (let y = -wingRadiusY - 4; y <= wingRadiusY + 4; y += 2) {
                const normalizedX = x / wingRadiusX;
                const normalizedY = y / wingRadiusY;
                const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
                if (distance <= 1.2) { // Larger for thicker outline
                    if (distance <= 1) {
                        ctx.fillStyle = '#FFA500'; // Orange wing
                    } else {
                        ctx.fillStyle = '#000'; // Black outline
                    }
                    ctx.fillRect(wingX + x, wingY + y, 2, 2);
                }
            }
        }
    }
    
    ctx.restore();
}

// Draw ground
function drawGround() {
    const groundY = GAME_CONFIG.canvas.height - 50;
    const offset = gameState.groundOffset || 0;
    
    // Single ground rectangle (dimmer green)
    ctx.fillStyle = GAME_CONFIG.colors.ground;
    ctx.fillRect(0, groundY, GAME_CONFIG.canvas.width, 50);
    
    // Ground border
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(0, groundY, GAME_CONFIG.canvas.width, 3);
    
    // Fewer, bigger flowers that move together
    const flowerColors = ['#FF69B4', '#FF1493', '#FFB6C1'];
    
    // Calculate how many flowers we need to cover the screen plus extra for smooth scrolling
    const flowerSpacing = 120;
    const numFlowers = Math.ceil(GAME_CONFIG.canvas.width / flowerSpacing) + 2;
    
    for (let i = 0; i < numFlowers; i++) {
        let x = i * flowerSpacing - offset;
        
        // Wrap around when flower goes off screen
        while (x < -flowerSpacing) {
            x += GAME_CONFIG.canvas.width + flowerSpacing;
        }
        
        const flowerY = groundY + 8;
        
        // Draw bigger 5-block flower pattern
        const flowerColor = flowerColors[i % flowerColors.length];
        
        // Center block (yellow) - bigger
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 3, flowerY + 3, 6, 6);
        
        // Surrounding 4 blocks (flower color) - bigger
        ctx.fillStyle = flowerColor;
        
        // Top block
        ctx.fillRect(x + 3, flowerY, 6, 3);
        
        // Bottom block
        ctx.fillRect(x + 3, flowerY + 9, 6, 3);
        
        // Left block
        ctx.fillRect(x, flowerY + 3, 3, 6);
        
        // Right block
        ctx.fillRect(x + 9, flowerY + 3, 3, 6);
    }
}

// UI Functions
function showMenuScreen() {
    menuScreen.style.display = 'block';
    gameUI.style.display = 'none';
    gameOverScreen.style.display = 'none';
    highScoreDisplay.textContent = gameState.highScore;
}

function showGameUI() {
    menuScreen.style.display = 'none';
    gameUI.style.display = 'block';
    gameOverScreen.style.display = 'none';
}

function showGameOverScreen() {
    menuScreen.style.display = 'none';
    gameUI.style.display = 'none';
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.textContent = gameState.score;
    finalHighScoreDisplay.textContent = gameState.highScore;
}

function updateScoreDisplay() {
    currentScoreDisplay.textContent = gameState.score;
}

// Audio Functions
function toggleAudio() {
    gameState.audioEnabled = !gameState.audioEnabled;
    audioBtn.textContent = gameState.audioEnabled ? '🔊' : '🔇';
    audioBtn.classList.toggle('muted', !gameState.audioEnabled);
}

// Local Storage Functions
function saveHighScore() {
    localStorage.setItem('flappyBirdHighScore', gameState.highScore.toString());
}

function loadHighScore() {
    const saved = localStorage.getItem('flappyBirdHighScore');
    gameState.highScore = saved ? parseInt(saved) : 0;
}

// Game Loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', init);

// Create smooth explosion animation
function createSmoothExplosion(x, y) {
    // Create multiple explosion rings
    for (let ring = 0; ring < 5; ring++) {
        const delay = ring * 3;
        const radius = ring * 20 + 10;
        const particleCount = 20 + ring * 10;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 6 + 3;
            const size = Math.random() * 8 + 4;
            const life = Math.random() * 80 + 60;
            const type = Math.random() < 0.4 ? 'flame' : Math.random() < 0.6 ? 'smoke' : 'debris';
            
            gameState.explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                size: size,
                life: life,
                maxLife: life,
                type: type,
                delay: delay,
                delayCount: 0,
                color: type === 'flame' ? '#FF4500' : type === 'smoke' ? '#696969' : '#8B4513',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }
    
    // Create shockwave effect
    for (let i = 0; i < 3; i++) {
        gameState.explosionFrames.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 150 + i * 50,
            life: 30,
            maxLife: 30,
            delay: i * 5
        });
    }
}

// Update explosion particles
function updateExplosionParticles() {
    for (let i = gameState.explosionParticles.length - 1; i >= 0; i--) {
        const particle = gameState.explosionParticles[i];
        
        // Handle delay
        if (particle.delayCount < particle.delay) {
            particle.delayCount++;
            continue;
        }
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Apply gravity to debris
        if (particle.type === 'debris') {
            particle.vy += 0.15;
        }
        
        // Apply upward force to smoke
        if (particle.type === 'smoke') {
            particle.vy -= 0.08;
        }
        
        // Apply wind effect to flames
        if (particle.type === 'flame') {
            particle.vx += (Math.random() - 0.5) * 0.3;
            particle.vy += (Math.random() - 0.5) * 0.2;
        }
        
        // Update life
        particle.life--;
        
        // Remove dead particles
        if (particle.life <= 0) {
            gameState.explosionParticles.splice(i, 1);
        }
    }
    
    // Update shockwave frames
    for (let i = gameState.explosionFrames.length - 1; i >= 0; i--) {
        const frame = gameState.explosionFrames[i];
        
        if (frame.delay > 0) {
            frame.delay--;
            continue;
        }
        
        frame.radius += frame.maxRadius / frame.maxLife;
        frame.life--;
        
        if (frame.life <= 0) {
            gameState.explosionFrames.splice(i, 1);
        }
    }
}

// Draw explosion particles
function drawExplosionParticles() {
    for (const particle of gameState.explosionParticles) {
        const alpha = particle.life / particle.maxLife;
        
        if (particle.type === 'flame') {
            // Draw smooth flame particles
            const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
            gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 69, 0, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (particle.type === 'smoke') {
            // Draw smooth smoke particles
            const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2);
            gradient.addColorStop(0, `rgba(105, 105, 105, ${alpha * 0.8})`);
            gradient.addColorStop(0.7, `rgba(169, 169, 169, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(169, 169, 169, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw debris particles
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            ctx.restore();
        }
    }
}

// Draw shockwave frames
function drawShockwaveFrames() {
    for (const frame of gameState.explosionFrames) {
        if (frame.delay > 0) continue;
        
        const alpha = frame.life / frame.maxLife;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(frame.x, frame.y, frame.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
} 