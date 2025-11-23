import { playAnimationSound } from '../../audio.js';
import { STICK_FIGURE_TOTAL_HEIGHT, EASTER_EGG_EMOJI } from '../../constants.js';
import { addShotgunParticle, consumeEnergy, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementConsecutiveIncinerations, incrementTotalInGameIncinerations } from '../state-manager.js';
import { checkShotgunCollision } from '../collision.js';

// Shotgun Skill Module
export const shotgunSkill = {
    config: {
        name: 'shotgunBlast',
        energyCost: 35,
    },

    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.isShotgunBlastActive) return;
        if (!consumeEnergy(state, this.config.name)) return;

        playAnimationSound('shotgun-blast');
        state.isShotgunBlastActive = true;

        const playerY = (state.stickFigureY + STICK_FIGURE_TOTAL_HEIGHT * 0.1) - 20; // Adjusted 10 pixels higher
        const particleCount = 15;
        const speed = 5;
        const spread = Math.PI / 24; // Narrower spread
        const upwardAngleOffset = -1 * (Math.PI / 180); // 6 degrees upward

        const currentSegment = state.raceSegments[state.currentSegmentIndex];
        const groundAngle = currentSegment ? currentSegment.angleRad : 0;

        for (let i = 0; i < particleCount; i++) {
            const angle = -groundAngle + (Math.random() * spread - spread / 2) + upwardAngleOffset;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            const particle = {
                x: state.stickFigureFixedX + 20,
                y: playerY,
                velocityX,
                velocityY,
                lifespan: 60
            };
            addShotgunParticle(state, particle);
        }

        setTimeout(() => {
            state.isShotgunBlastActive = false;
        }, 500);
    },

    update: function(gameState, deltaTime) {
        for (let i = gameState.shotgunParticles.length - 1; i >= 0; i--) {
            const particle = gameState.shotgunParticles[i];
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.lifespan--;

            let particleRemoved = false;
            const obstaclesToCheck = [
                gameState.currentObstacle,
                ...gameState.ignitedObstacles,
                ...gameState.vanishingObstacles
            ].filter(Boolean);

            for (const obstacle of obstaclesToCheck) {
                if (checkShotgunCollision(particle, obstacle)) {
                    addIncineratingObstacle({
                        ...obstacle,
                        animationProgress: 0,
                        startTime: performance.now(),
                        animationType: 'incinerate-ash-blow'
                    });

                    if (obstacle === gameState.currentObstacle) {
                        setCurrentObstacle(null);
                    }
                    
                    if (obstacle.emoji !== EASTER_EGG_EMOJI) {
                        incrementObstaclesIncinerated();
                        incrementTotalInGameIncinerations();
                        incrementConsecutiveIncinerations();
                    }

                    gameState.shotgunParticles.splice(i, 1);
                    particleRemoved = true;
                    break;
                }
            }

            if (!particleRemoved && particle.lifespan <= 0) {
                gameState.shotgunParticles.splice(i, 1);
            }
        }
    }
};
