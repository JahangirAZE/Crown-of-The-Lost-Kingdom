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
        
        // Preload sprites
        this.sprites = {
            player: SpriteGenerator.createPlayerSprite(),
            playerAttack: SpriteGenerator.createPlayerAttackSprite(),
            enemies: {},
            items: {}
        };
        
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
                // Get or create sprite for this item type
                if (!this.sprites.items[item.type]) {
                    this.sprites.items[item.type] = SpriteGenerator.createItemSprite(item.type);
                }
                
                const sprite = this.sprites.items[item.type];
                
                // Draw sprite with floating animation
                const time = this.gameTime * 0.003;
                const floatOffset = Math.sin(time + item.x) * 5;
                
                ctx.drawImage(sprite, item.x - 16, item.y - 16 + floatOffset, 32, 32);
                
                // Glow effect
                const glow = Math.sin(time) * 5 + 5;
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = glow;
                ctx.drawImage(sprite, item.x - 16, item.y - 16 + floatOffset, 32, 32);
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

let game;
window.addEventListener('load', () => {
    game = new Game();
});