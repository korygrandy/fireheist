import { playAnimationSound } from '../../audio.js';
import { STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { addShotgunParticle, consumeEnergy, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementConsecutiveIncinerations } from '../state-manager.js';
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

        const playerY = state.stickFigureY + STICK_FIGURE_TOTAL_HEIGHT / 2;
        const particleCount = 15;
        const speed = 5;
        const spread = Math.PI / 12;

        const currentSegment = state.raceSegments[state.currentSegmentIndex];
        const groundAngle = currentSegment ? currentSegment.angleRad : 0;

        for (let i = 0; i < particleCount; i++) {
            const angle = -groundAngle + (Math.random() * spread - spread / 2);
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
                    
                    playAnimationSound('shatter');
                    incrementObstaclesIncinerated();
                    incrementConsecutiveIncinerations();

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
