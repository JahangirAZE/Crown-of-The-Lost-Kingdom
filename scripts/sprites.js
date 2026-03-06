// ============================================================================
// SPRITE GENERATOR - Creates pixel art sprites
// ============================================================================

class SpriteGenerator {
    static createPlayerSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Disable image smoothing for crisp pixels
        ctx.imageSmoothingEnabled = false;
        
        // Scale factor for easier drawing
        const s = 4;
        
        // Head
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(6*s, 2*s, 4*s, 4*s);
        
        // Hair
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(6*s, 2*s, 4*s, 2*s);
        ctx.fillRect(5*s, 3*s, 1*s, 1*s);
        ctx.fillRect(10*s, 3*s, 1*s, 1*s);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(7*s, 4*s, 1*s, 1*s);
        ctx.fillRect(8*s, 4*s, 1*s, 1*s);
        
        // Body (armor)
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(6*s, 6*s, 4*s, 4*s);
        
        // Chest plate detail
        ctx.fillStyle = '#6ab0f2';
        ctx.fillRect(7*s, 7*s, 2*s, 2*s);
        
        // Arms
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(5*s, 7*s, 1*s, 3*s);
        ctx.fillRect(10*s, 7*s, 1*s, 3*s);
        
        // Legs
        ctx.fillStyle = '#2c5aa0';
        ctx.fillRect(6*s, 10*s, 2*s, 4*s);
        ctx.fillRect(8*s, 10*s, 2*s, 4*s);
        
        // Boots
        ctx.fillStyle = '#654321';
        ctx.fillRect(6*s, 13*s, 2*s, 1*s);
        ctx.fillRect(8*s, 13*s, 2*s, 1*s);
        
        return canvas;
    }
    
    static createPlayerAttackSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        const s = 4;
        
        // Copy base sprite
        const base = this.createPlayerSprite();
        ctx.drawImage(base, 0, 0);
        
        // Sword
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(11*s, 6*s, 6*s, 1*s);
        ctx.fillRect(10*s, 5*s, 1*s, 3*s);
        
        // Sword tip
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(17*s, 5*s, 2*s, 3*s);
        
        // Hilt
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(9*s, 5*s, 2*s, 3*s);
        
        return canvas;
    }
    
    static createEnemySprite(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        const s = 4;
        
        const colors = {
            goblin: { body: '#7cb342', face: '#9ccc65', eyes: '#ff0000' },
            wolf: { body: '#8d6e63', face: '#a1887f', eyes: '#ffeb3b' },
            skeleton: { body: '#e0e0e0', face: '#f5f5f5', eyes: '#ff0000' },
            spirit: { body: '#9c27b0', face: '#ba68c8', eyes: '#00ffff' },
            sandMonster: { body: '#ff9800', face: '#ffb74d', eyes: '#000' },
            scorpion: { body: '#d84315', face: '#ff5722', eyes: '#000' },
            spider: { body: '#424242', face: '#616161', eyes: '#ff0000' },
            golem: { body: '#607d8b', face: '#78909c', eyes: '#ffeb3b' },
            iceWolf: { body: '#4fc3f7', face: '#81d4fa', eyes: '#fff' },
            frostGiant: { body: '#81d4fa', face: '#b3e5fc', eyes: '#00bcd4' },
            shadowCreature: { body: '#212121', face: '#424242', eyes: '#f44336' },
            witch: { body: '#4a148c', face: '#6a1b9a', eyes: '#76ff03' },
            guard: { body: '#f44336', face: '#e57373', eyes: '#000' },
            knight: { body: '#ff5722', face: '#ff8a65', eyes: '#000' },
            elite: { body: '#c62828', face: '#e53935', eyes: '#ffeb3b' },
            mage: { body: '#3f51b5', face: '#5c6bc0', eyes: '#00ffff' },
            boss: { body: '#000', face: '#212121', eyes: '#ff0000' }
        };
        
        const color = colors[type] || colors.goblin;
        
        // Body
        ctx.fillStyle = color.body;
        ctx.fillRect(5*s, 6*s, 6*s, 6*s);
        
        // Head
        ctx.fillStyle = color.face;
        ctx.fillRect(6*s, 3*s, 4*s, 4*s);
        
        // Eyes (menacing)
        ctx.fillStyle = color.eyes;
        ctx.fillRect(7*s, 4*s, 1*s, 1*s);
        ctx.fillRect(8*s, 4*s, 1*s, 1*s);
        
        // Mouth (evil grin)
        ctx.fillStyle = '#000';
        ctx.fillRect(7*s, 5*s, 2*s, 1*s);
        
        // Arms
        ctx.fillStyle = color.body;
        ctx.fillRect(4*s, 7*s, 1*s, 3*s);
        ctx.fillRect(11*s, 7*s, 1*s, 3*s);
        
        // Legs
        ctx.fillRect(6*s, 12*s, 2*s, 2*s);
        ctx.fillRect(8*s, 12*s, 2*s, 2*s);
        
        // Special features for bosses
        if (type === 'boss') {
            // Crown
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(6*s, 2*s, 4*s, 1*s);
            ctx.fillRect(6*s, 1*s, 1*s, 1*s);
            ctx.fillRect(8*s, 1*s, 1*s, 1*s);
            ctx.fillRect(9*s, 1*s, 1*s, 1*s);
            
            // Cape
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(4*s, 6*s, 8*s, 1*s);
            ctx.fillRect(3*s, 7*s, 10*s, 3*s);
        }
        
        return canvas;
    }
    
    static createItemSprite(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        const s = 4;
        
        switch(type) {
            case 'gold':
                // Gold coin
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(1*s, 2*s, 6*s, 4*s);
                ctx.fillStyle = '#ffed4e';
                ctx.fillRect(2*s, 2*s, 4*s, 4*s);
                ctx.fillStyle = '#daa520';
                ctx.fillRect(3*s, 3*s, 2*s, 2*s);
                break;
                
            case 'healthPotion':
                // Red potion bottle
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(3*s, 1*s, 2*s, 1*s);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(2*s, 2*s, 4*s, 4*s);
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(3*s, 3*s, 2*s, 2*s);
                break;
                
            case 'artifact':
                // Diamond/crystal
                ctx.fillStyle = '#00bcd4';
                ctx.fillRect(3*s, 2*s, 2*s, 1*s);
                ctx.fillRect(2*s, 3*s, 4*s, 2*s);
                ctx.fillRect(3*s, 5*s, 2*s, 1*s);
                ctx.fillStyle = '#4dd0e1';
                ctx.fillRect(3*s, 3*s, 1*s, 1*s);
                break;
        }
        
        return canvas;
    }
}