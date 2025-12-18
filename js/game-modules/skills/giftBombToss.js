import { gameState, consumeEnergy, setObstacleHit, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementTotalInGameIncinerations, incrementConsecutiveIncinerations } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { GROUND_Y, EASTER_EGG_EMOJI } from '../../constants.js';
import { checkGiftBombCollision } from '../collision.js';

// Gift bomb projectiles in flight
let giftBombs = [];

const GIFT_BOMB_CONFIG = {
    name: 'giftBombToss',
    energyCost: 25,
    initialVelocity: 8,
    gravity: 0.15,
    maxBounces: 1,
    explosionRadius: 80,
    explosionDamage: 2, // Collision multiplier
};

export const giftBombTossSkill = {
    config: {
        name: 'giftBombToss',
        energyCost: GIFT_BOMB_CONFIG.energyCost,
        displayName: 'Gift Bomb Toss',
        emoji: '🎁',
        description: 'Throw gift boxes that explode on impact'
    },

    activate: function(state) {
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) {
            return;
        }

        // Create a gift bomb at the player position
        const giftBomb = {
            x: 150, // Player X position (STICK_FIGURE_FIXED_X)
            y: GROUND_Y - 40, // Slightly above ground
            vx: GIFT_BOMB_CONFIG.initialVelocity,
            vy: -GIFT_BOMB_CONFIG.initialVelocity * 0.8, // Arc upward
            bounces: 0,
            active: true,
            lifetime: 0,
            rotation: 0,
            rotationSpeed: Math.random() * 0.3 - 0.15
        };

        giftBombs.push(giftBomb);
        playAnimationSound('ho'); // Ho ho ho - Santa laugh
    },

    update: function(state, deltaTime) {
        if (!giftBombs || giftBombs.length === 0) {
            return;
        }

        // Update each gift bomb
        for (let i = giftBombs.length - 1; i >= 0; i--) {
            const bomb = giftBombs[i];
            
            if (!bomb.active) {
                giftBombs.splice(i, 1);
                continue;
            }

            // Apply gravity
            bomb.vy += GIFT_BOMB_CONFIG.gravity;

            // Update position
            bomb.x += bomb.vx;
            bomb.y += bomb.vy;
            bomb.lifetime += deltaTime;
            bomb.rotation += bomb.rotationSpeed;

            // Check for direct obstacle collision during flight
            const obstaclesToCheck = [state.currentObstacle, ...state.ignitedObstacles].filter(Boolean);
            let hitObstacle = false;
            for (const obstacle of obstaclesToCheck) {
                if (checkGiftBombCollision(bomb, obstacle)) {
                    // Immediately incinerate the hit obstacle
                    setObstacleHit(obstacle);
                    addIncineratingObstacle({ ...obstacle, animationProgress: 0, startTime: performance.now(), animationType: 'giftBomb' });
                    if (obstacle === state.currentObstacle) {
                        setCurrentObstacle(null);
                    }
                    if (obstacle.emoji !== EASTER_EGG_EMOJI) {
                        incrementObstaclesIncinerated();
                        incrementTotalInGameIncinerations();
                        incrementConsecutiveIncinerations();
                    }
                    
                    // Play collision sound
                    playAnimationSound('present-bomb-collision');
                    
                    // Create explosion visual effect at bomb location
                    this.explode(state, bomb);
                    bomb.active = false;
                    hitObstacle = true;
                    break; // Stop checking after first collision
                }
            }

            if (hitObstacle) {
                continue; // Skip ground check if we hit an obstacle
            }

            // Check if bomb hits ground
            if (bomb.y >= GROUND_Y - 10) {
                if (bomb.bounces < GIFT_BOMB_CONFIG.maxBounces) {
                    // Bounce
                    bomb.vy = -bomb.vy * 0.6; // Reduce bounce height
                    bomb.vx *= 0.8; // Reduce horizontal velocity
                    bomb.bounces++;
                    bomb.y = GROUND_Y - 10;
                } else {
                    // Explode
                    this.explode(state, bomb);
                    bomb.active = false;
                }
            }

            // Despawn if off-screen for too long
            if (bomb.lifetime > 5000 || bomb.x > 900) {
                bomb.active = false;
            }
        }
    },

    explode: function(state, bomb) {
        // Create explosion particles
        if (!state.giftBombExplosions) {
            state.giftBombExplosions = [];
        }

        // Add explosion effect - purely visual
        state.giftBombExplosions.push({
            x: bomb.x,
            y: bomb.y,
            radius: GIFT_BOMB_CONFIG.explosionRadius,
            lifetime: 0,
            maxLifetime: 300
        });
    },

    draw: function(ctx, state) {
        if (!giftBombs || giftBombs.length === 0) {
            return;
        }

        ctx.save();

        // Draw gift bombs
        for (const bomb of giftBombs) {
            if (!bomb.active) continue;

            ctx.save();
            ctx.translate(bomb.x, bomb.y);
            ctx.rotate(bomb.rotation);

            // Draw gift box
            const size = 16;
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(-size / 2, -size / 2, size, size);

            // Draw gold ribbon
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-size / 2, 0);
            ctx.lineTo(size / 2, 0);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(0, size / 2);
            ctx.stroke();

            // Draw bow
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, -size / 2 - 4, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw explosions
        if (state.giftBombExplosions) {
            for (let i = state.giftBombExplosions.length - 1; i >= 0; i--) {
                const explosion = state.giftBombExplosions[i];
                explosion.lifetime += 16; // Approximate deltaTime

                if (explosion.lifetime > explosion.maxLifetime) {
                    state.giftBombExplosions.splice(i, 1);
                    continue;
                }

                const progress = explosion.lifetime / explosion.maxLifetime;
                const opacity = 1 - progress;
                const currentRadius = explosion.radius * (0.8 + progress * 0.4);

                // Explosion ring
                ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.6})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(explosion.x, explosion.y, currentRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Inner glow
                ctx.fillStyle = `rgba(255, 165, 0, ${opacity * 0.3})`;
                ctx.beginPath();
                ctx.arc(explosion.x, explosion.y, currentRadius * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    },

    // Getter for external access to bombs array
    getActiveBombs: function() {
        return giftBombs.filter(b => b.active);
    },

    // Clear all bombs (for game reset)
    reset: function() {
        giftBombs = [];
    }
};
