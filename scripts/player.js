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
        
        // Get appropriate sprite
        const sprite = this.attacking ? this.game.sprites.playerAttack : this.game.sprites.player;
        
        // Flip sprite based on facing direction
        if (this.facing === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, -this.x - 32, this.y - 4, 64, 64);
        } else {
            ctx.drawImage(sprite, this.x - 32, this.y - 4, 64, 64);
        }
        
        ctx.restore();
    }
}