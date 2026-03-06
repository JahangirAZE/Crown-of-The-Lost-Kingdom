// ============================================================================
// CROWN OF THE LOST KINGDOM - Complete Game System
// ============================================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.state = 'menu'; // menu, playing, paused, gameover, victory
        this.currentRegion = 0;
        this.gameTime = 0;
        this.isPaused = false;
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            shake: 0,
            shakeIntensity: 0
        };
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.platforms = [];
        this.items = [];
        this.npcs = [];
        this.particles = [];
        this.projectiles = [];
        
        // Game data
        this.regions = this.initRegions();
        this.inventory = this.initInventory();
        this.currentQuest = null;
        this.completedQuests = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.player = new Player(200, 500, this);
        this.loadRegion(0);
        this.gameLoop();
    }
    
    initRegions() {
        return [
            {
                id: 0,
                name: 'Green Forest',
                bgColor: '#2d5016',
                groundColor: '#1a2f0a',
                enemyTypes: ['goblin', 'wolf'],
                quest: 'Find the Ancient Sword',
                bossDefeated: false
            },
            {
                id: 1,
                name: 'Forgotten Ruins',
                bgColor: '#4a4a4a',
                groundColor: '#2a2a2a',
                enemyTypes: ['skeleton', 'spirit'],
                quest: 'Collect 3 Ancient Keys',
                bossDefeated: false
            },
            {
                id: 2,
                name: 'Sand Desert',
                bgColor: '#d4a574',
                groundColor: '#c2935b',
                enemyTypes: ['sandMonster', 'scorpion'],
                quest: 'Find the Golden Artifact',
                bossDefeated: false
            },
            {
                id: 3,
                name: 'Crystal Caves',
                bgColor: '#1a1a40',
                groundColor: '#0f0f28',
                enemyTypes: ['spider', 'golem'],
                quest: 'Solve the Light Puzzle',
                bossDefeated: false
            },
            {
                id: 4,
                name: 'Frozen Mountains',
                bgColor: '#a8c5d1',
                groundColor: '#7a98a8',
                enemyTypes: ['iceWolf', 'frostGiant'],
                quest: 'Reach the Summit',
                bossDefeated: false
            },
            {
                id: 5,
                name: 'Shadow Forest',
                bgColor: '#1a0f2e',
                groundColor: '#0f0619',
                enemyTypes: ['shadowCreature', 'witch'],
                quest: 'Light the Sacred Flames',
                bossDefeated: false
            },
            {
                id: 6,
                name: 'Ancient City',
                bgColor: '#3d3d3d',
                groundColor: '#252525',
                enemyTypes: ['guard', 'knight'],
                quest: 'Unlock the City Gates',
                bossDefeated: false
            },
            {
                id: 7,
                name: 'Dark Fortress',
                bgColor: '#0f0f0f',
                groundColor: '#050505',
                enemyTypes: ['elite', 'mage'],
                quest: 'Defeat the Emperor',
                bossDefeated: false
            }
        ];
    }
    
    initInventory() {
        return {
            weapons: [{ name: 'Iron Sword', icon: '⚔️', equipped: true }],
            armor: [],
            potions: [
                { name: 'Health Potion', icon: '🧪', count: 3 },
                { name: 'Stamina Potion', icon: '⚡', count: 2 }
            ],
            artifacts: [],
            keys: [],
            treasures: []
        };
    }
    
    loadRegion(regionId) {
        this.currentRegion = regionId;
        const region = this.regions[regionId];
        
        // Clear existing entities
        this.enemies = [];
        this.platforms = [];
        this.items = [];
        this.npcs = [];
        
        // Generate platforms
        this.generatePlatforms(region);
        
        // Spawn enemies
        this.spawnEnemies(region);
        
        // Spawn items
        this.spawnItems(region);
        
        // Update quest
        this.currentQuest = region.quest;
        this.updateQuestUI();
        
        // Reset player position
        if (this.player) {
            this.player.x = 200;
            this.player.y = 500;
        }
        
        this.showNotification(`Entering ${region.name}`);
    }
    
    generatePlatforms(region) {
        // Ground platform
        this.platforms.push({
            x: 0,
            y: this.height - 50,
            width: this.width * 3,
            height: 50,
            type: 'ground'
        });
        
        // Random platforms based on region
        const platformCount = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < platformCount; i++) {
            this.platforms.push({
                x: 200 + i * 300 + Math.random() * 100,
                y: 400 - Math.random() * 250,
                width: 100 + Math.random() * 100,
                height: 20,
                type: 'platform'
            });
        }
    }
    
    spawnEnemies(region) {
        const enemyCount = 5 + region.id;
        for (let i = 0; i < enemyCount; i++) {
            const type = region.enemyTypes[Math.floor(Math.random() * region.enemyTypes.length)];
            const x = 400 + i * 400 + Math.random() * 200;
            this.enemies.push(new Enemy(x, 400, type, this));
        }
        
        // Boss at the end
        if (!region.bossDefeated && region.id > 0) {
            this.enemies.push(new Enemy(this.width * 2.5, 400, 'boss', this));
        }
    }
    
    spawnItems(region) {
        // Gold coins
        for (let i = 0; i < 10; i++) {
            this.items.push({
                x: 300 + i * 250 + Math.random() * 100,
                y: 300 + Math.random() * 200,
                type: 'gold',
                value: 10,
                collected: false,
                icon: '💰'
            });
        }
        
        // Health potions
        for (let i = 0; i < 3; i++) {
            this.items.push({
                x: 500 + i * 400,
                y: 350,
                type: 'healthPotion',
                value: 1,
                collected: false,
                icon: '🧪'
            });
        }
        
        // Special item at the end
        this.items.push({
            x: this.width * 2.8,
            y: 300,
            type: 'artifact',
            value: 1,
            collected: false,
            icon: '💎'
        });
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'Escape') {
                this.togglePause();
            }
            if (e.key.toLowerCase() === 'i') {
                this.toggleInventory();
            }
            if (e.key === '2') {
                this.usePotion('health');
            }
            if (e.key === '3') {
                this.usePotion('stamina');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
    }
    
    update(deltaTime) {
        if (this.state !== 'playing' || this.isPaused) return;
        
        this.gameTime += deltaTime;
        
        // Update player
        this.player.update(deltaTime);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            if (!enemy.isDead) {
                enemy.update(deltaTime);
            }
        });
        
        // Remove dead enemies after delay
        this.enemies = this.enemies.filter(enemy => !enemy.removeMe);
        
        // Update projectiles
        this.projectiles.forEach(proj => proj.update(deltaTime));
        this.projectiles = this.projectiles.filter(proj => !proj.removeMe);
        
        // Update particles
        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Update camera
        this.updateCamera();
        
        // Check item collection
        this.checkItemCollection();
        
        // Check region progression
        if (this.player.x > this.width * 2.9 && this.currentRegion < 7) {
            this.nextRegion();
        }
        
        // Update UI
        this.updateUI();
    }
    
    updateCamera() {
        // Follow player
        this.camera.x = this.player.x - this.width / 2;
        this.camera.y = this.player.y - this.height / 2;
        
        // Clamp camera
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.width * 3 - this.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.height - this.height));
        
        // Camera shake
        if (this.camera.shake > 0) {
            this.camera.shake -= 0.5;
            this.camera.x += (Math.random() - 0.5) * this.camera.shakeIntensity;
            this.camera.y += (Math.random() - 0.5) * this.camera.shakeIntensity;
        }
    }
    
    checkItemCollection() {
        this.items.forEach(item => {
            if (item.collected) return;
            
            const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
            if (dist < 40) {
                item.collected = true;
                this.collectItem(item);
            }
        });
    }
    
    collectItem(item) {
        switch (item.type) {
            case 'gold':
                this.player.gold += item.value;
                this.showNotification(`+${item.value} Gold`);
                break;
            case 'healthPotion':
                this.inventory.potions[0].count++;
                this.showNotification('Health Potion acquired!');
                break;
            case 'artifact':
                this.inventory.artifacts.push({ name: 'Ancient Artifact', icon: '💎' });
                this.showNotification('Ancient Artifact acquired!');
                break;
        }
        
        // Particle effect
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(item.x, item.y, item.icon));
        }
    }
    
    render() {
        const ctx = this.ctx;
        const region = this.regions[this.currentRegion];
        
        // Clear canvas
        ctx.fillStyle = region.bgColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Save context for camera
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw parallax background
        this.drawParallax(region);
        
        // Draw platforms
        this.platforms.forEach(platform => {
            ctx.fillStyle = region.groundColor;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Platform edge
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Draw items
        this.items.forEach(item => {
            if (!item.collected) {
                ctx.font = '32px Arial';
                ctx.fillText(item.icon, item.x - 16, item.y + 10);
                
                // Glow effect
                const time = this.gameTime * 0.003;
                const glow = Math.sin(time) * 5 + 5;
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = glow;
                ctx.fillText(item.icon, item.x - 16, item.y + 10);
                ctx.shadowBlur = 0;
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.render(ctx));
        
        // Draw player
        this.player.render(ctx);
        
        // Draw projectiles
        this.projectiles.forEach(proj => proj.render(ctx));
        
        // Draw particles
        this.particles.forEach(p => p.render(ctx));
        
        // Draw region name
        ctx.font = 'bold 24px Courier New';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(region.name, this.camera.x + 20, this.camera.y + 40);
        
        ctx.restore();
    }
    
    drawParallax(region) {
        const ctx = this.ctx;
        
        // Distant background (moves slower)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 300 - this.camera.x * 0.2) % 1500;
            ctx.fillRect(x, this.camera.y + 100, 200, 300);
        }
        
        // Mid-ground (moves normal)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 8; i++) {
            const x = (i * 200 - this.camera.x * 0.5) % 1200;
            ctx.fillRect(x, this.camera.y + 200, 100, 200);
        }
    }
    
    gameLoop() {
        const deltaTime = 16.67; // ~60 FPS
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateUI() {
        // Health
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthBar').style.width = healthPercent + '%';
        document.getElementById('healthText').textContent = 
            `${Math.round(this.player.health)}/${this.player.maxHealth}`;
        
        // Stamina
        const staminaPercent = (this.player.stamina / this.player.maxStamina) * 100;
        document.getElementById('staminaBar').style.width = staminaPercent + '%';
        document.getElementById('staminaText').textContent = 
            `${Math.round(this.player.stamina)}/${this.player.maxStamina}`;
        
        // Experience
        const expPercent = (this.player.experience / this.player.expToLevel) * 100;
        document.getElementById('expBar').style.width = expPercent + '%';
        document.getElementById('expText').textContent = 
            `${this.player.experience}/${this.player.expToLevel}`;
        
        // Level
        document.getElementById('levelText').textContent = this.player.level;
        
        // Gold
        document.getElementById('goldText').textContent = this.player.gold;
        
        // Potion count
        const healthPotions = this.inventory.potions[0].count;
        document.getElementById('potion1').textContent = healthPotions > 0 ? `🧪${healthPotions}` : '';
    }
    
    updateQuestUI() {
        const questObj = document.getElementById('questObjectives');
        questObj.innerHTML = `<div class="quest-objective">→ ${this.currentQuest}</div>`;
    }
    
    // ========================================================================
    // GAME CONTROL METHODS
    // ========================================================================
    
    startNewGame() {
        document.getElementById('mainMenu').classList.add('hidden');
        this.state = 'playing';
        this.player = new Player(200, 500, this);
        this.loadRegion(0);
        this.showNotification('Your journey begins...');
    }
    
    continueGame() {
        const saved = localStorage.getItem('crownSaveData');
        if (saved) {
            const data = JSON.parse(saved);
            this.loadSaveData(data);
            document.getElementById('mainMenu').classList.add('hidden');
            this.state = 'playing';
            this.showNotification('Game loaded!');
        } else {
            this.showNotification('No save data found!');
        }
    }
    
    showControls() {
        alert('Controls:\n\n← → - Move\nSPACE - Jump\nZ - Attack\nX - Dash\nE - Interact\nI - Inventory\n2 - Use Health Potion\nESC - Pause');
    }
    
    togglePause() {
        if (this.state !== 'playing') return;
        
        this.isPaused = !this.isPaused;
        const pauseMenu = document.getElementById('pauseMenu');
        
        if (this.isPaused) {
            pauseMenu.classList.add('visible');
        } else {
            pauseMenu.classList.remove('visible');
        }
    }
    
    resumeGame() {
        this.isPaused = false;
        document.getElementById('pauseMenu').classList.remove('visible');
    }
    
    toggleInventory() {
        const panel = document.getElementById('inventoryPanel');
        const isVisible = panel.classList.contains('visible');
        
        if (isVisible) {
            this.closeInventory();
        } else {
            this.openInventory();
        }
    }
    
    openInventory() {
        this.isPaused = true;
        const panel = document.getElementById('inventoryPanel');
        panel.classList.add('visible');
        this.renderInventory();
    }
    
    closeInventory() {
        this.isPaused = false;
        document.getElementById('inventoryPanel').classList.remove('visible');
    }
    
    renderInventory() {
        const grid = document.getElementById('inventoryGrid');
        grid.innerHTML = '';
        
        // Combine all items
        const allItems = [
            ...this.inventory.weapons,
            ...this.inventory.armor,
            ...this.inventory.potions,
            ...this.inventory.artifacts,
            ...this.inventory.treasures
        ];
        
        // Create 24 slots
        for (let i = 0; i < 24; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (allItems[i]) {
                const item = allItems[i];
                slot.innerHTML = item.icon;
                
                if (item.count > 1) {
                    const count = document.createElement('div');
                    count.className = 'item-count';
                    count.textContent = item.count;
                    slot.appendChild(count);
                }
                
                slot.title = item.name;
            }
            
            grid.appendChild(slot);
        }
    }
    
    usePotion(type) {
        if (type === 'health') {
            const potion = this.inventory.potions[0];
            if (potion.count > 0 && this.player.health < this.player.maxHealth) {
                potion.count--;
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
                this.showNotification('Health restored!');
            }
        }
    }
    
    saveGame() {
        const saveData = {
            region: this.currentRegion,
            player: {
                x: this.player.x,
                y: this.player.y,
                health: this.player.health,
                level: this.player.level,
                experience: this.player.experience,
                gold: this.player.gold
            },
            inventory: this.inventory,
            regions: this.regions
        };
        
        localStorage.setItem('crownSaveData', JSON.stringify(saveData));
        this.showNotification('Game saved!');
    }
    
    loadSaveData(data) {
        this.currentRegion = data.region;
        this.inventory = data.inventory;
        this.regions = data.regions;
        
        this.player.x = data.player.x;
        this.player.y = data.player.y;
        this.player.health = data.player.health;
        this.player.level = data.player.level;
        this.player.experience = data.player.experience;
        this.player.gold = data.player.gold;
        
        this.loadRegion(this.currentRegion);
    }
    
    returnToMenu() {
        this.state = 'menu';
        this.isPaused = false;
        document.getElementById('pauseMenu').classList.remove('visible');
        document.getElementById('gameOverScreen').classList.remove('visible');
        document.getElementById('victoryScreen').classList.remove('visible');
        document.getElementById('mainMenu').classList.remove('hidden');
    }
    
    gameOver() {
        this.state = 'gameover';
        document.getElementById('gameOverScreen').classList.add('visible');
    }
    
    respawn() {
        this.player.health = this.player.maxHealth;
        this.player.x = 200;
        this.player.y = 500;
        this.state = 'playing';
        document.getElementById('gameOverScreen').classList.remove('visible');
        this.loadRegion(this.currentRegion);
    }
    
    victory() {
        this.state = 'victory';
        document.getElementById('victoryScreen').classList.add('visible');
        this.showNotification('The kingdom is saved!');
    }
    
    nextRegion() {
        if (this.currentRegion < 7) {
            this.currentRegion++;
            this.loadRegion(this.currentRegion);
            
            if (this.currentRegion === 7) {
                this.showNotification('You have reached the Dark Fortress!');
            }
        }
    }
    
    showNotification(message) {
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.classList.add('visible');
        
        setTimeout(() => {
            notif.classList.remove('visible');
        }, 2000);
    }
    
    cameraShake(intensity = 10, duration = 10) {
        this.camera.shake = duration;
        this.camera.shakeIntensity = intensity;
    }
}

// ============================================================================
// PLAYER CLASS
// ============================================================================

class Player {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        
        // Stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxStamina = 100;
        this.stamina = 100;
        this.attackPower = 20;
        this.defense = 5;
        this.speed = 5;
        this.jumpPower = 15;
        
        // Progression
        this.level = 1;
        this.experience = 0;
        this.expToLevel = 100;
        this.gold = 0;
        
        // Physics
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.canDoubleJump = true;
        
        // Actions
        this.facing = 1; // 1 = right, -1 = left
        this.attacking = false;
        this.attackCooldown = 0;
        this.dashCooldown = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        
        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
    }
    
    update(deltaTime) {
        const keys = this.game.keys;
        
        // Movement
        this.vx *= 0.8;
        
        if (keys['arrowright'] || keys['d']) {
            this.vx = this.speed;
            this.facing = 1;
        }
        if (keys['arrowleft'] || keys['a']) {
            this.vx = -this.speed;
            this.facing = -1;
        }
        
        // Jump
        if ((keys[' '] || keys['w'] || keys['arrowup']) && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
            this.canDoubleJump = true;
        } else if ((keys[' '] || keys['w'] || keys['arrowup']) && this.canDoubleJump && !this.onGround) {
            this.vy = -this.jumpPower * 0.8;
            this.canDoubleJump = false;
        }
        
        // Attack
        if (keys['z'] && this.attackCooldown <= 0 && !this.attacking) {
            this.attack();
        }
        
        // Dash
        if (keys['x'] && this.dashCooldown <= 0 && this.stamina > 20) {
            this.dash();
        }
        
        // Apply gravity
        this.vy += 0.8;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Check collision with platforms
        this.checkPlatformCollision();
        
        // Check collision with enemies
        this.checkEnemyCollision();
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.attacking && this.attackCooldown <= 10) this.attacking = false;
        
        // Regenerate stamina
        if (this.stamina < this.maxStamina) {
            this.stamina += 0.5;
        }
        
        // Invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Animation
        this.animTimer++;
        if (this.animTimer > 10) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
        
        // Check death
        if (this.health <= 0) {
            this.game.gameOver();
        }
        
        // Bounds
        if (this.y > this.game.height) {
            this.takeDamage(20);
            this.y = 100;
            this.vy = 0;
        }
    }
    
    checkPlatformCollision() {
        this.onGround = false;
        
        this.game.platforms.forEach(platform => {
            // Check if player is above platform
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height >= platform.y &&
                this.y + this.height <= platform.y + 20 &&
                this.vy >= 0) {
                
                this.y = platform.y - this.height;
                this.vy = 0;
                this.onGround = true;
            }
        });
    }
    
    checkEnemyCollision() {
        if (this.invulnerable) return;
        
        this.game.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (dist < 50) {
                if (this.attacking) {
                    // Damage enemy
                    enemy.takeDamage(this.attackPower);
                } else {
                    // Take damage
                    this.takeDamage(enemy.damage);
                }
            }
        });
    }
    
    attack() {
        this.attacking = true;
        this.attackCooldown = 30;
        
        // Check hit enemies
        this.game.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            const attackRange = 80;
            
            // Check if enemy is in front of player
            const inFront = (this.facing === 1 && enemy.x > this.x) || 
                           (this.facing === -1 && enemy.x < this.x);
            
            if (dist < attackRange && inFront) {
                enemy.takeDamage(this.attackPower);
                
                // Knockback
                enemy.vx = this.facing * 8;
                enemy.vy = -5;
            }
        });
    }
    
    dash() {
        this.vx = this.facing * 15;
        this.stamina -= 20;
        this.dashCooldown = 60;
        this.invulnerable = true;
        this.invulnerableTimer = 20;
        
        // Particle trail
        for (let i = 0; i < 5; i++) {
            this.game.particles.push(new Particle(this.x, this.y + 30, '💨'));
        }
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return;
        
        const actualDamage = Math.max(1, amount - this.defense);
        this.health -= actualDamage;
        this.invulnerable = true;
        this.invulnerableTimer = 60;
        
        // Knockback
        this.vy = -8;
        
        // Camera shake
        this.game.cameraShake(5, 10);
        
        // Damage particles
        for (let i = 0; i < 3; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '💥'));
        }
    }
    
    gainExperience(amount) {
        this.experience += amount;
        
        if (this.experience >= this.expToLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experience = 0;
        this.expToLevel = Math.floor(this.expToLevel * 1.5);
        
        // Stat increases
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.maxStamina += 10;
        this.stamina = this.maxStamina;
        this.attackPower += 5;
        this.defense += 2;
        
        this.game.showNotification(`Level Up! Now level ${this.level}!`);
        this.game.cameraShake(8, 15);
        
        // Level up particles
        for (let i = 0; i < 20; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '⭐'));
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Invulnerability flash
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Body
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
        
        // Head
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(this.x, this.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Sword
        if (this.attacking) {
            ctx.fillStyle = '#c0c0c0';
            const swordX = this.x + this.facing * 40;
            const swordY = this.y + 30;
            ctx.fillRect(swordX - 5, swordY - 2, 30, 6);
            
            // Sword tip
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(swordX + 20, swordY - 4, 10, 10);
        }
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 5, this.y + 12, 3, 3);
        ctx.fillRect(this.x + 2, this.y + 12, 3, 3);
        
        ctx.restore();
    }
}

// ============================================================================
// ENEMY CLASS
// ============================================================================

class Enemy {
    constructor(x, y, type, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 50;
        
        this.initStats(type);
        
        // Physics
        this.vx = 0;
        this.vy = 0;
        
        // AI
        this.state = 'patrol'; // patrol, chase, attack, retreat
        this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
        this.patrolTimer = 0;
        this.attackCooldown = 0;
        
        // Status
        this.isDead = false;
        this.removeMe = false;
        this.deathTimer = 0;
    }
    
    initStats(type) {
        const stats = {
            goblin: { health: 30, damage: 5, speed: 2, exp: 20, gold: 10, color: '#7cb342' },
            wolf: { health: 25, damage: 8, speed: 4, exp: 15, gold: 5, color: '#8d6e63' },
            skeleton: { health: 40, damage: 10, speed: 2, exp: 30, gold: 15, color: '#e0e0e0' },
            spirit: { health: 20, damage: 15, speed: 3, exp: 25, gold: 20, color: '#9c27b0' },
            sandMonster: { health: 50, damage: 12, speed: 2, exp: 35, gold: 25, color: '#ff9800' },
            scorpion: { health: 35, damage: 10, speed: 3, exp: 28, gold: 18, color: '#d84315' },
            spider: { health: 30, damage: 8, speed: 3, exp: 22, gold: 12, color: '#424242' },
            golem: { health: 80, damage: 20, speed: 1, exp: 50, gold: 40, color: '#607d8b' },
            iceWolf: { health: 45, damage: 15, speed: 4, exp: 40, gold: 30, color: '#4fc3f7' },
            frostGiant: { health: 100, damage: 25, speed: 1, exp: 60, gold: 50, color: '#81d4fa' },
            shadowCreature: { health: 50, damage: 18, speed: 3, exp: 45, gold: 35, color: '#212121' },
            witch: { health: 40, damage: 20, speed: 2, exp: 50, gold: 45, color: '#4a148c' },
            guard: { health: 60, damage: 15, speed: 2, exp: 40, gold: 30, color: '#f44336' },
            knight: { health: 80, damage: 20, speed: 2, exp: 55, gold: 45, color: '#ff5722' },
            elite: { health: 90, damage: 25, speed: 3, exp: 70, gold: 60, color: '#c62828' },
            mage: { health: 50, damage: 30, speed: 2, exp: 65, gold: 55, color: '#3f51b5' },
            boss: { health: 200, damage: 30, speed: 2, exp: 200, gold: 200, color: '#000' }
        };
        
        const stat = stats[type] || stats.goblin;
        this.maxHealth = stat.health;
        this.health = stat.health;
        this.damage = stat.damage;
        this.speed = stat.speed;
        this.expReward = stat.exp;
        this.goldReward = stat.gold;
        this.color = stat.color;
        this.isBoss = type === 'boss';
    }
    
    update(deltaTime) {
        if (this.isDead) {
            this.deathTimer++;
            if (this.deathTimer > 60) {
                this.removeMe = true;
            }
            return;
        }
        
        const player = this.game.player;
        const distToPlayer = Math.hypot(this.x - player.x, this.y - player.y);
        
        // AI behavior
        if (distToPlayer < 200 && distToPlayer > 60) {
            this.state = 'chase';
        } else if (distToPlayer <= 60) {
            this.state = 'attack';
        } else {
            this.state = 'patrol';
        }
        
        // Execute state
        switch (this.state) {
            case 'patrol':
                this.patrol();
                break;
            case 'chase':
                this.chase(player);
                break;
            case 'attack':
                this.attackPlayer(player);
                break;
        }
        
        // Apply gravity
        this.vy += 0.8;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision
        this.checkPlatformCollision();
        
        // Friction
        this.vx *= 0.8;
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
    }
    
    patrol() {
        this.patrolTimer++;
        
        if (this.patrolTimer > 120) {
            this.patrolDirection *= -1;
            this.patrolTimer = 0;
        }
        
        this.vx = this.patrolDirection * this.speed * 0.5;
    }
    
    chase(player) {
        const direction = player.x > this.x ? 1 : -1;
        this.vx = direction * this.speed;
    }
    
    attackPlayer(player) {
        if (this.attackCooldown <= 0) {
            this.attackCooldown = 60;
            
            // Melee attack - damage is dealt in player collision check
        }
    }
    
    checkPlatformCollision() {
        this.game.platforms.forEach(platform => {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height >= platform.y &&
                this.y + this.height <= platform.y + 20 &&
                this.vy >= 0) {
                
                this.y = platform.y - this.height;
                this.vy = 0;
            }
        });
    }
    
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        
        // Damage particles
        for (let i = 0; i < 3; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '💥'));
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isDead = true;
        
        // Rewards
        this.game.player.gainExperience(this.expReward);
        this.game.player.gold += this.goldReward;
        
        // Death particles
        for (let i = 0; i < 10; i++) {
            this.game.particles.push(new Particle(this.x, this.y, '✨'));
        }
        
        // Check if boss
        if (this.isBoss) {
            this.game.regions[this.game.currentRegion].bossDefeated = true;
            this.game.showNotification('Boss Defeated!');
            this.game.cameraShake(15, 30);
            
            if (this.game.currentRegion === 7) {
                // Final boss defeated
                setTimeout(() => this.game.victory(), 2000);
            }
        }
    }
    
    render(ctx) {
        if (this.isDead) {
            ctx.globalAlpha = 1 - (this.deathTimer / 60);
        }
        
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
        
        // Eyes (menacing)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 8, this.y + 10, 4, 4);
        ctx.fillRect(this.x + 4, this.y + 10, 4, 4);
        
        // Boss crown
        if (this.isBoss) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '24px Arial';
            ctx.fillText('👑', this.x - 12, this.y - 10);
        }
        
        // Health bar
        if (!this.isDead && this.health < this.maxHealth) {
            const barWidth = 40;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barWidth/2, this.y - 10, barWidth, 4);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - barWidth/2, this.y - 10, barWidth * healthPercent, 4);
        }
        
        ctx.globalAlpha = 1;
    }
}

// ============================================================================
// PARTICLE CLASS
// ============================================================================

class Particle {
    constructor(x, y, icon) {
        this.x = x;
        this.y = y;
        this.icon = icon;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6 - 3;
        this.life = 60;
        this.maxLife = 60;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.life--;
    }
    
    render(ctx) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.font = '16px Arial';
        ctx.fillText(this.icon, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

// ============================================================================
// PROJECTILE CLASS (for future ranged attacks)
// ============================================================================

class Projectile {
    constructor(x, y, vx, vy, damage, game) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.game = game;
        this.removeMe = false;
        this.life = 120;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        
        if (this.life <= 0) {
            this.removeMe = true;
        }
        
        // Check collision with enemies
        this.game.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (dist < 30) {
                enemy.takeDamage(this.damage);
                this.removeMe = true;
            }
        });
    }
    
    render(ctx) {
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================================================
// START GAME
// ============================================================================

let game;
window.addEventListener('load', () => {
    game = new Game();
});