class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Game states
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        
        // Bird properties
        this.currentCharacter = 0;
        this.bird = {
            x: 50,
            y: 300,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -8,
            color: '#FF0000',
            size: 30
        };
        
        // Pipe properties
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpawnInterval = 2000;
        this.lastPipeSpawn = 0;
        
        // Characters system
        this.characters = [
            { name: 'Red Bird', score: 0, unlocked: true },
            { name: 'Blue Bird', score: 10, unlocked: false },
            { name: 'Golden Bird', score: 20, unlocked: false },
            { name: 'Robot Bird', score: 30, unlocked: false },
            { name: 'Ninja Bird', score: 40, unlocked: false },
            { name: 'Rainbow Bird', score: 50, unlocked: false },
            { name: 'Ghost Bird', score: 60, unlocked: false },
            { name: 'Dragon Bird', score: 70, unlocked: false },
            { name: 'Phoenix Bird', score: 80, unlocked: false },
            { name: 'Space Bird', score: 100, unlocked: false }
        ];
        
        this.setupEventListeners();
        this.loadCharacters();
        this.showMenu();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (this.gameStarted) {
                    this.bird.velocity = this.bird.jumpForce;
                }
            }
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.gameStarted) {
                this.bird.velocity = this.bird.jumpForce;
            }
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('charactersBtn').addEventListener('click', () => this.showCharacters());
        
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showMenu());
        });
    }
    
    loadCharacters() {
        const grid = document.getElementById('character-grid');
        grid.innerHTML = '';
        
        this.characters.forEach((char, index) => {
            const div = document.createElement('div');
            div.className = `character-item ${char.unlocked ? '' : 'locked'}`;
            div.innerHTML = `
                <h3>${char.name}</h3>
                <p>${char.unlocked ? 'Click to Select' : `Score ${char.score} to unlock`}</p>
            `;
            if (char.unlocked) {
                div.addEventListener('click', () => {
                    this.currentCharacter = index;
                    this.updateCharacterColors();
                    this.showMenu();
                });
            }
            grid.appendChild(div);
        });
    }
    
    updateCharacterColors() {
        const colors = [
            '#FF0000', '#0000FF', '#FFD700', '#808080', '#000000',
            '#FF69B4', '#8A2BE2', '#228B22', '#FFA500', '#4169E1'
        ];
        this.bird.color = colors[this.currentCharacter];
    }

    createPartyPopper() {
        const partyPopper = document.createElement('div');
        partyPopper.className = 'party-popper';
        document.body.appendChild(partyPopper);

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.animationDelay = Math.random() * 2 + 's';
            partyPopper.appendChild(confetti);
        }

        setTimeout(() => {
            partyPopper.remove();
        }, 5000);
    }

    showMenu() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById('menu').classList.remove('hidden');
        this.canvas.style.display = 'none';
        document.getElementById('highScoreDisplay').textContent = `High Score: ${this.highScore}`;
    }
    
    showSettings() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById('settings').classList.remove('hidden');
    }
    
    showCharacters() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById('characters').classList.remove('hidden');
    }
    
    startGame() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        this.canvas.style.display = 'block';
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.pipes = [];
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.lastPipeSpawn = 0;
        requestAnimationFrame(() => this.gameLoop());
    }
    
    createPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        return {
            x: this.canvas.width,
            height: height,
            passed: false
        };
    }
    
    drawBird() {
        const ctx = this.ctx;
        
        // Main body (red)
        ctx.fillStyle = this.bird.color;
        ctx.beginPath();
        ctx.arc(this.bird.x, this.bird.y, this.bird.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.fillStyle = '#CC0000';
        ctx.beginPath();
        ctx.moveTo(this.bird.x - this.bird.size/2, this.bird.y);
        ctx.lineTo(this.bird.x - this.bird.size, this.bird.y - this.bird.size/4);
        ctx.lineTo(this.bird.x - this.bird.size, this.bird.y + this.bird.size/4);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.bird.x + this.bird.size/4, this.bird.y - this.bird.size/6, this.bird.size/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.bird.x + this.bird.size/4, this.bird.y - this.bird.size/6, this.bird.size/12, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(this.bird.x + this.bird.size/2, this.bird.y);
        ctx.lineTo(this.bird.x + this.bird.size, this.bird.y);
        ctx.lineTo(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/4);
        ctx.fill();
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#00CC00';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.height);
            // Bottom pipe
            this.ctx.fillRect(
                pipe.x,
                pipe.height + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.height + this.pipeGap)
            );
        });
    }
    
    drawScore() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '40px Arial';
        this.ctx.fillText(this.score, this.canvas.width/2 - 20, 50);
    }
    
    checkCollision(pipe) {
        const birdRight = this.bird.x + this.bird.size/2;
        const birdLeft = this.bird.x - this.bird.size/2;
        const birdTop = this.bird.y - this.bird.size/2;
        const birdBottom = this.bird.y + this.bird.size/2;
        
        // Check collision with pipes
        if (birdRight > pipe.x && birdLeft < pipe.x + this.pipeWidth) {
            if (birdTop < pipe.height || birdBottom > pipe.height + this.pipeGap) {
                return true;
            }
        }
        
        // Check collision with ground or ceiling
        return birdTop < 0 || birdBottom > this.canvas.height;
    }
    
    updateGame() {
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Spawn new pipes
        const currentTime = Date.now();
        if (currentTime - this.lastPipeSpawn > this.pipeSpawnInterval) {
            this.pipes.push(this.createPipe());
            this.lastPipeSpawn = currentTime;
        }
        
        // Update pipes and check collisions
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= 2;
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Check for score
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.checkUnlocks();
            }
            
            // Check for collision
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.score);
                    this.createPartyPopper();
                }
                setTimeout(() => this.showMenu(), 1500);
                return;
            }
        }
    }
    
    checkUnlocks() {
        this.characters.forEach(char => {
            if (!char.unlocked && this.score >= char.score) {
                char.unlocked = true;
                this.loadCharacters();
            }
        });
    }
    
    gameLoop() {
        if (!this.gameStarted) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.gameOver) {
            this.updateGame();
        }
        
        this.drawPipes();
        this.drawBird();
        this.drawScore();
        
        if (!this.gameOver) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when page loads
window.onload = () => {
    new Game();
};