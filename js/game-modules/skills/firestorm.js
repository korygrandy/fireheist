import { playAnimationSound } from '../../audio.js';
import { canvas } from '../../dom-elements.js';
import { getSkillModifiedValue, setFirestormActive, setFirestormEndTime, setFirestormDrainingEnergy, setFirestormDrainEndTime, setPlayerEnergy, addIgnitedObstacle, setCurrentObstacle } from '../state-manager.js';
import { firestormUpgradeEffects } from '../skill-upgrades.js';

// Firestorm Skill Module
export const firestormSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.isFirestormActive) return;
        if (state.playerEnergy <= state.maxPlayerEnergy * 0.5) {
            console.log("-> firestormSkill.activate: Not enough energy to activate. Requires > 50%.");
            return;
        }

        const skillLevel = state.playerStats.skillLevels.firestorm || 1;
        const baseDuration = 10000; // 10 seconds
        const modifiedDuration = getSkillModifiedValue(baseDuration, 'firestorm', firestormUpgradeEffects, state);

        setFirestormActive(true);
        setFirestormEndTime(Date.now() + modifiedDuration);
        setFirestormDrainingEnergy(true);
        setFirestormDrainEndTime(Date.now() + modifiedDuration);
        playAnimationSound('firestorm');
        console.log("-> firestormSkill.activate: Firestorm V2 initiated.");
    },

    update: function(gameState, deltaTime) {
        if (gameState.isFirestormDrainingEnergy) {
            const remainingTime = gameState.firestormDrainEndTime - Date.now();
            if (remainingTime <= 0) {
                setPlayerEnergy(0);
                setFirestormDrainingEnergy(false);
            } else {
                const energyToDrain = gameState.playerEnergy;
                const drainRate = energyToDrain / remainingTime;
                setPlayerEnergy(Math.max(0, gameState.playerEnergy - (drainRate * deltaTime)));
            }
        }

        if (gameState.isFirestormActive) {
            if (Date.now() > gameState.firestormEndTime) {
                setFirestormActive(false);
            } else {
                // Create new particles for the storm effect
                if (gameState.frameCount % 2 === 0) { // Control particle density
                    // Create flashes
                    gameState.firestormParticles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        life: 1,
                        size: Math.random() * 15 + 5,
                        color: `rgba(255, ${Math.floor(Math.random() * 150)}, 0, 0.7)`
                    });

                    // Create player embers
                    gameState.playerEmberParticles.push({
                        x: gameState.stickFigureFixedX,
                        y: gameState.stickFigureY,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -Math.random() * 2,
                        life: 1,
                        size: Math.random() * 3 + 1
                    });
                }

                const skillLevel = gameState.playerStats.skillLevels.firestorm || 1;

                // Lightning flashes for Level 3+, with increasing intensity
                if (skillLevel >= 3) {
                    if (!gameState.firestormNextFlashTime) {
                        gameState.firestormNextFlashTime = Date.now() + (Math.random() * 1000 + 500); // Initial flash delay
                    }

                    if (Date.now() >= gameState.firestormNextFlashTime) {
                        gameState.firestormLightningFlashes.push({
                            duration: Math.random() * 200 + 50, // 50ms to 250ms
                            startTime: Date.now()
                        });

                        let nextFlashDelay;
                        if (skillLevel >= 4 && Math.random() < 0.6) { // Level 4+ rapid flashes
                            nextFlashDelay = Math.random() * 100; // 0-100ms
                        } else { // Level 3 moderate flashes
                            nextFlashDelay = Math.random() * 400 + 100; // 100-500ms
                        }
                        gameState.firestormNextFlashTime = Date.now() + nextFlashDelay;
                    }
                }

                if (skillLevel >= 5 && !gameState.isFireShieldActive) {
                    if (!gameState.fireShieldSpawnTimer) {
                        gameState.fireShieldSpawnTimer = 3000;
                    }
                    gameState.fireShieldSpawnTimer -= deltaTime;
                    if (gameState.fireShieldSpawnTimer <= 0) {
                        gameState.isFireShieldActive = true;
                        gameState.fireShieldEndTime = Date.now() + 2000;
                        gameState.fireShieldSpawnTimer = 3000;
                    }
                }

                if (gameState.currentObstacle && !gameState.ignitedObstacles.some(o => o.x === gameState.currentObstacle.x)) {
                    const burnoutDuration = 500 + Math.random() * 1000;
                    addIgnitedObstacle({
                        ...gameState.currentObstacle,
                        burnoutTime: Date.now() + burnoutDuration,
                        speedMultiplier: 1.2
                    });
                    setCurrentObstacle(null);
                    console.log("-> Firestorm: Robust catch-all ignited a stray obstacle.");
                }
            }
        }

        if (gameState.isFireShieldActive && Date.now() > gameState.fireShieldEndTime) {
            gameState.isFireShieldActive = false;
        }

        // Update flashes
        for (let i = gameState.firestormParticles.length - 1; i >= 0; i--) {
            const p = gameState.firestormParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            p.size *= 0.95; // Shrink
            if (p.life <= 0 || p.size <= 0.5) {
                gameState.firestormParticles.splice(i, 1);
            }
        }

        // Update embers
        for (let i = gameState.playerEmberParticles.length - 1; i >= 0; i--) {
            const p = gameState.playerEmberParticles[i];
            p.vx += (Math.random() - 0.5) * 0.4; // Wind
            p.vy += 0.05; // Gravity
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03; // Fade faster
            p.size *= 0.97; // Shrink
            if (p.life <= 0 || p.size < 0.5) {
                gameState.playerEmberParticles.splice(i, 1);
            }
        }

        // Update lightning flashes
        for (let i = gameState.firestormLightningFlashes.length - 1; i >= 0; i--) {
            const flash = gameState.firestormLightningFlashes[i];
            if (Date.now() - flash.startTime > flash.duration) {
                gameState.firestormLightningFlashes.splice(i, 1);
            }
        }
    },

    draw: function(ctx, gameState, playerY) {
        if (!gameState.isFirestormActive) return;

        // Draw flashes
        for (const p of gameState.firestormParticles) {
            ctx.save();
            ctx.globalAlpha = p.life;

            // Outer glow
            ctx.shadowColor = 'rgba(255, 100, 0, 0.7)';
            ctx.shadowBlur = 15;

            // Main particle body
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Inner core
            ctx.shadowColor = 'transparent'; // No glow for the core
            ctx.fillStyle = `rgba(255, 255, 150, ${p.life * 0.8})`; // Brighter, yellowish core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw embers
        for (const p of gameState.playerEmberParticles) {
            ctx.save();
            ctx.globalAlpha = p.life;

            // Main particle body with flickering color
            const flicker = Math.floor(Math.random() * 100);
            ctx.fillStyle = `rgba(255, ${100 + flicker}, 0, 0.8)`;
            ctx.shadowColor = 'orange';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Brighter core
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = `rgba(255, 255, 200, ${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw lightning flashes
        for (const flash of gameState.firestormLightningFlashes) {
            const elapsed = Date.now() - flash.startTime;
            const progress = elapsed / flash.duration;
            const opacity = Math.sin(progress * Math.PI) * 0.5; // Fade in and out

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
};
