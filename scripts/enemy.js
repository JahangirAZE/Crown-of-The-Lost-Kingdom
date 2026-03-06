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
        
        // Get or create sprite for this enemy type
        if (!this.game.sprites.enemies[this.type]) {
            this.game.sprites.enemies[this.type] = SpriteGenerator.createEnemySprite(this.type);
        }
        
        const sprite = this.game.sprites.enemies[this.type];
        
        // Draw sprite
        ctx.drawImage(sprite, this.x - 32, this.y - 4, 64, 64);
        
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