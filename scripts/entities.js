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