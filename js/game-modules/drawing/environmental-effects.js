import state from '../state.js';
import { canvas, ctx } from '../../dom-elements.js';

const RAIN_DENSITY = 100; // Number of raindrops
const RAIN_DURATION = 5000; // 5 seconds

// --- Universal Effect Trigger for Debugging ---
export function startThemeEffect() {
    console.log(`-> DEBUG: startThemeEffect called for theme: ${state.selectedTheme}`);
    switch (state.selectedTheme) {
        case 'grass':
            startRainShower();
            break;
        case 'snow':
            startSnowfall();
            break;
        case 'roadway':
            startHeadlights();
            startFog();
            break;
        case 'mountains':
            startRockslide();
            break;
                case 'desert':
            startTumbleweed();
            startSandGust();
            startTornado();
            break;
        case 'outerspace':
            startAsteroidField();
            startShootingStar();
            startNebulaCloud();
            break;
        case 'night':
            startFireflies();
            startMoonGlow();
            break;
        case 'volcano':
            startVolcanoSmoke();
            startAshfall();
            startHeatShimmer();
            startEmberShower();
            break;
        default:
            console.log(`-> DEBUG: No specific effect to trigger for theme '${state.selectedTheme}'.`);
            break;
    }
}

// --- Rain Effect Logic ---

export function startRainShower() {
    if (state.environmentalEffects.raindrops.length > 0) return; // Prevent starting a new shower if one is active
    console.log("-> DEBUG: Starting rain shower.");
    for (let i = 0; i < RAIN_DENSITY; i++) {
        state.environmentalEffects.raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height, // Start off-screen
            length: Math.random() * 20 + 10,
            speed: Math.random() * 5 + 5
        });
    }

    // Set a timer to clear the rain after the specified duration
    setTimeout(() => {
        state.environmentalEffects.raindrops = [];
    }, RAIN_DURATION);
}

function updateGrassThemeEffects(deltaTime) {
    // The deltaTime is not used here for simplicity, but it's good practice to pass it for future physics-based effects.
    for (const drop of state.environmentalEffects.raindrops) {
        drop.y += drop.speed;
        // Reset drop when it goes off-screen
        if (drop.y > canvas.height) {
            drop.y = Math.random() * -canvas.height;
            drop.x = Math.random() * canvas.width;
        }
    }
}

function drawGrassThemeEffects() {
    if (state.environmentalEffects.raindrops.length === 0) return;

    ctx.strokeStyle = 'rgba(174,194,224,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const drop of state.environmentalEffects.raindrops) {
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
    }
    ctx.stroke();
}

// --- Rockslide Effect (Mountains Theme) ---

const ROCK_COUNT = 5;
const ROCK_DURATION = 1000; // 1 second

function startRockslide() {
    if (state.environmentalEffects.rocks.length > 0) return;
    console.log("-> DEBUG: Starting rockslide.");
    for (let i = 0; i < ROCK_COUNT; i++) {
        state.environmentalEffects.rocks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height / 2, // Start off-screen
            size: Math.random() * 10 + 5,
            speedX: Math.random() * 4 - 2, // Slight horizontal movement
            speedY: Math.random() * 5 + 8, // Faster vertical speed
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    setTimeout(() => {
        state.environmentalEffects.rocks = [];
    }, ROCK_DURATION);
}

function updateMountainsThemeEffects(deltaTime) {
    for (const rock of state.environmentalEffects.rocks) {
        rock.x += rock.speedX;
        rock.y += rock.speedY;
        rock.rotation += rock.rotationSpeed;
    }
}

function drawMountainsThemeEffects() {
    if (state.environmentalEffects.rocks.length === 0) return;

    ctx.fillStyle = '#6B4226'; // Brown rock color
    for (const rock of state.environmentalEffects.rocks) {
        ctx.save();
        ctx.translate(rock.x, rock.y);
        ctx.rotate(rock.rotation * Math.PI / 180);
        ctx.fillRect(-rock.size / 2, -rock.size / 2, rock.size, rock.size);
        ctx.restore();
    }
}

// --- Headlights Effect (Roadway Theme) ---

const HEADLIGHT_COUNT = 2; // Two beams per car
const HEADLIGHT_SPEED = 8; // Pixels per frame
const HEADLIGHT_DURATION = 2000; // 2 seconds

function startHeadlights() {
    // Only allow one set of headlights at a time for simplicity
    if (state.environmentalEffects.headlights.length > 0) return;
    console.log("-> DEBUG: Starting headlights.");
    const yPosition = Math.random() * (canvas.height * 0.6) + (canvas.height * 0.2); // Middle 60% of screen
    const baseWidth = 10; // Width of the headlight beam at its origin
    const spread = 100; // How much the beam spreads out over its length
    const length = canvas.width * 0.7; // How far the beam extends across the screen

    for (let i = 0; i < HEADLIGHT_COUNT; i++) {
        state.environmentalEffects.headlights.push({
            x: -length - (i * 50), // Start well off-screen to the left, with offset for second light
            y: yPosition + (i * 15), // Slight vertical offset for perspective
            baseWidth: baseWidth,
            spread: spread,
            length: length,
            color: i === 0 ? '255, 255, 200' : '255, 255, 255', // Slightly different colors (RGB components)
            speed: HEADLIGHT_SPEED // Use constant speed
        });
    }

    setTimeout(() => {
        state.environmentalEffects.headlights = [];
    }, HEADLIGHT_DURATION);
}

// --- Fog Effect (Roadway Theme) ---

const FOG_PATCH_COUNT = 3;
const FOG_SPEED = 0.5; // Pixels per frame
const FOG_DURATION = 10000; // 10 seconds

function startFog() {
    if (state.environmentalEffects.fogPatches.length > 0) return;
    console.log("-> DEBUG: Starting fog.");
    for (let i = 0; i < FOG_PATCH_COUNT; i++) {
        const type = Math.random() > 0.5 ? 'oval' : 'streak';
        const patch = {
            type: type,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            opacity: Math.random() * 0.1 + 0.05, // Very subtle fog
            speed: FOG_SPEED + (Math.random() * 0.5 - 0.25)
        };

        if (type === 'oval') {
            patch.radiusX = Math.random() * 200 + 100;
            patch.radiusY = Math.random() * 50 + 20;
        } else { // streak
            patch.width = Math.random() * 300 + 200; // Longer than ovals
            patch.height = Math.random() * 10 + 5; // Thinner than ovals
        }
        state.environmentalEffects.fogPatches.push(patch);
    }

    setTimeout(() => {
        state.environmentalEffects.fogPatches = [];
    }, FOG_DURATION);
}

function updateRoadwayThemeEffects(deltaTime) {
    // Update Headlights
    for (const light of state.environmentalEffects.headlights) {
        light.x += light.speed;
    }

    // Update shared headlight fade state
    const fadeState = state.environmentalEffects.headlightFadeState;
    fadeState.opacity += fadeState.fadeDirection * fadeState.fadeSpeed;
    if (fadeState.opacity > 1) { fadeState.opacity = 1; fadeState.fadeDirection = -1; }
    if (fadeState.opacity < 0.3) { fadeState.opacity = 0.3; fadeState.fadeDirection = 1; }

    // Apply shared opacity to all headlights
    for (const light of state.environmentalEffects.headlights) {
        light.opacity = fadeState.opacity;
    }

    // Update Fog
    for (const fog of state.environmentalEffects.fogPatches) {
        fog.x += fog.speed;
        const offScreenWidth = fog.type === 'oval' ? fog.radiusX : fog.width;
        if (fog.x > canvas.width + offScreenWidth) {
            fog.x = -offScreenWidth; // Loop fog around
        }
    }

    // Update Cityscape
    updateCityscape();
    if (state.environmentalEffects.cityscape.buildings.length === 0 && Math.random() < 0.001 && state.gameRunning) {
        startCityscape();
    }
}

function drawRoadwayThemeEffects() {
    // Draw Cityscape first so it's in the back
    drawCityscape();

    // Draw Headlights
    for (const light of state.environmentalEffects.headlights) {
        ctx.save();
        ctx.globalAlpha = light.opacity; // Apply overall opacity

        // Calculate trapezoid points
        const startX = light.x;
        const endX = light.x + light.length;
        const startY1 = light.y - light.baseWidth / 2;
        const startY2 = light.y + light.baseWidth / 2;
        const endY1 = light.y - light.baseWidth / 2 - light.spread / 2;
        const endY2 = light.y + light.baseWidth / 2 + light.spread / 2;

        // Create a radial gradient for light falloff
        const gradient = ctx.createRadialGradient(
            startX, light.y, light.baseWidth / 2, // Inner circle (brightest)
            endX, light.y, light.spread // Outer circle (fades out)
        );
        gradient.addColorStop(0, `rgba(${light.color}, ${light.opacity})`);
        gradient.addColorStop(0.5, `rgba(${light.color}, ${light.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${light.color}, 0)`);

        ctx.fillStyle = gradient;

        // Draw trapezoid
        ctx.beginPath();
        ctx.moveTo(startX, startY1);
        ctx.lineTo(endX, endY1);
        ctx.lineTo(endX, endY2);
        ctx.lineTo(startX, startY2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Draw Fog
    for (const fog of state.environmentalEffects.fogPatches) {
        ctx.save();
        ctx.globalAlpha = fog.opacity;

        if (fog.type === 'oval') {
            ctx.beginPath();
            ctx.ellipse(fog.x, fog.y, fog.radiusX, fog.radiusY, Math.PI / 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF'; // White fog
            ctx.fill();
        } else { // streak
            const gradient = ctx.createLinearGradient(fog.x, 0, fog.x + fog.width, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(fog.x, fog.y, fog.width, fog.height);
        }

        ctx.restore();
    }
}

// --- Cityscape Effect (Roadway Theme) ---

const BUILDING_COUNT = 15;
const WINDOW_SIZE = 8;
const WINDOW_SPACING = 4;
const WINDOW_FLICKER_CHANCE = 0.01; // Increased chance per frame to toggle a window

function startCityscape() {
    if (state.environmentalEffects.cityscape.buildings.length > 0) return;
    console.log("-> DEBUG: Starting cityscape.");

    const buildings = [];
    let currentX = 0;

    for (let i = 0; i < BUILDING_COUNT; i++) {
        const width = Math.random() * 100 + 50;
        const height = Math.random() * (canvas.height * 0.6) + (canvas.height * 0.2);
        const building = {
            x: currentX,
            y: canvas.height - height,
            width: width,
            height: height,
            windows: []
        };

        // Populate windows
        const totalWindowWidth = WINDOW_SIZE + WINDOW_SPACING;
        const totalWindowHeight = WINDOW_SIZE + WINDOW_SPACING;
        const cols = Math.floor((width - WINDOW_SPACING) / totalWindowWidth);
        const rows = Math.floor((height - WINDOW_SPACING) / totalWindowHeight);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const on = Math.random() > 0.4; // 60% chance a window is on initially
                building.windows.push({
                    x: building.x + WINDOW_SPACING + c * totalWindowWidth,
                    y: building.y + WINDOW_SPACING + r * totalWindowHeight,
                    on: on,
                    opacity: on ? 1.0 : 0.0,
                    targetOpacity: on ? 1.0 : 0.0,
                    fadeSpeed: 0.05
                });
            }
        }

        buildings.push(building);
        currentX += width + Math.random() * 20 + 10; // Gap between buildings
    }
    state.environmentalEffects.cityscape.buildings = buildings;
}

function updateCityscape() {
    const buildings = state.environmentalEffects.cityscape.buildings;
    if (buildings.length === 0) return;

    // Randomly toggle a window's state
    if (Math.random() < WINDOW_FLICKER_CHANCE) {
        const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        if (randomBuilding.windows.length > 0) {
            const randomWindow = randomBuilding.windows[Math.floor(Math.random() * randomBuilding.windows.length)];
            randomWindow.on = !randomWindow.on;
            randomWindow.targetOpacity = randomWindow.on ? 1.0 : 0.0;
        }
    }

    // Update window opacity for smooth transitions
    for (const building of buildings) {
        for (const window of building.windows) {
            if (window.opacity < window.targetOpacity) {
                window.opacity = Math.min(window.opacity + window.fadeSpeed, window.targetOpacity);
            } else if (window.opacity > window.targetOpacity) {
                window.opacity = Math.max(window.opacity - window.fadeSpeed, window.targetOpacity);
            }
        }
    }
}

export function drawCityscape() {
    const buildings = state.environmentalEffects.cityscape.buildings;
    if (buildings.length === 0) return;

    for (const building of buildings) {
        // Draw building silhouette
        ctx.fillStyle = 'rgba(26, 26, 42, 0.2)'; // Dark blue/purple with 20% opacity
        ctx.fillRect(building.x, building.y, building.width, building.height);

        // Draw windows
        for (const window of building.windows) {
            if (window.opacity > 0) {
                ctx.fillStyle = `rgba(255, 220, 100, ${window.opacity * 0.2})`; // Warm yellow light with reduced base opacity
                ctx.fillRect(window.x, window.y, WINDOW_SIZE, WINDOW_SIZE);
            }
        }
    }
}


// --- Snowfall Effect (Snow Theme) ---

const SNOW_DENSITY = 150;
const SNOW_DURATION = 8000; // 8 seconds
const WIND_GUST_PARTICLES = 50;
const WIND_GUST_DURATION = 1500; // 1.5 seconds
const KICKED_UP_SNOW_COUNT = 30;
const GRAVITY = 0.1; // A simple gravity effect for the kicked up snow

function startSnowfall() {
    if (state.environmentalEffects.snowflakes.length > 0) return;
    console.log("-> DEBUG: Starting snowfall.");
    for (let i = 0; i < SNOW_DENSITY; i++) {
        state.environmentalEffects.snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 2 - 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }

    setTimeout(() => {
        state.environmentalEffects.snowflakes = [];
    }, SNOW_DURATION);
}

function startWindGust() {
    // Wind Gust Lines
    if (state.environmentalEffects.windGusts.length === 0) {
        console.log("-> DEBUG: Starting wind gust.");
        const startY = Math.random() * canvas.height;
        const gustSpeed = Math.random() * 15 + 10;

        for (let i = 0; i < WIND_GUST_PARTICLES; i++) {
            state.environmentalEffects.windGusts.push({
                x: -50 - (Math.random() * 100),
                y: startY + (Math.random() - 0.5) * 80,
                length: Math.random() * 30 + 20,
                speedX: gustSpeed + (Math.random() * 5 - 2.5),
                opacity: Math.random() * 0.3 + 0.1
            });
        }

        setTimeout(() => {
            state.environmentalEffects.windGusts = [];
        }, WIND_GUST_DURATION);
    }

    // Kicked Up Snow Particles
    if (state.environmentalEffects.kickedUpSnow.length === 0) {
        const gustSpeed = Math.random() * 10 + 5; // Horizontal speed for the snow
        for (let i = 0; i < KICKED_UP_SNOW_COUNT; i++) {
            state.environmentalEffects.kickedUpSnow.push({
                x: Math.random() * canvas.width,
                y: canvas.height, // Start at the bottom
                size: Math.random() * 2 + 1,
                speedX: gustSpeed + (Math.random() - 0.5) * 5,
                speedY: -Math.random() * 3 - 2, // Initial upward velocity
                opacity: Math.random() * 0.5 + 0.5,
                life: 1.0 // Lifespan of the particle
            });
        }
    }
}

function updateSnowThemeEffects(deltaTime) {
    // Update Snowflakes
    for (const flake of state.environmentalEffects.snowflakes) {
        flake.y += flake.speedY;
        flake.x += flake.speedX;
        if (flake.y > canvas.height) {
            flake.y = Math.random() * -50;
            flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
    }

    // Update Wind Gusts
    for (const gust of state.environmentalEffects.windGusts) {
        gust.x += gust.speedX;
    }

    // Update Kicked Up Snow
    for (let i = state.environmentalEffects.kickedUpSnow.length - 1; i >= 0; i--) {
        const particle = state.environmentalEffects.kickedUpSnow[i];
        particle.speedY += GRAVITY; // Apply gravity
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.01; // Decrease life
        particle.opacity = particle.life; // Fade out

        if (particle.life <= 0) {
            state.environmentalEffects.kickedUpSnow.splice(i, 1);
        }
    }
}

function drawSnowThemeEffects() {
    // Draw Snowflakes
    if (state.environmentalEffects.snowflakes.length > 0) {
        for (const flake of state.environmentalEffects.snowflakes) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Draw Wind Gusts
    if (state.environmentalEffects.windGusts.length > 0) {
        for (const gust of state.environmentalEffects.windGusts) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${gust.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(gust.x, gust.y);
            ctx.lineTo(gust.x + gust.length, gust.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Draw Kicked Up Snow
    if (state.environmentalEffects.kickedUpSnow.length > 0) {
        for (const particle of state.environmentalEffects.kickedUpSnow) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// --- Desert Theme Effects ---

const TUMBLEWEED_DURATION = 5000; // 5 seconds
const SAND_GUST_PARTICLES = 100;
const SAND_GUST_DURATION = 1000; // 1 second
const TORNADO_DURATION = 8000; // 8 seconds
const TORNADO_PARTICLE_COUNT = 300;

function startTumbleweed() {
    if (state.environmentalEffects.tumbleweeds.length > 0) return;
    console.log("-> DEBUG: Starting tumbleweed.");
    state.environmentalEffects.tumbleweeds.push({
        x: -50,
        y: canvas.height - 50,
        size: Math.random() * 30 + 20,
        speedX: Math.random() * 5 + 5,
        rotation: 0,
        rotationSpeed: Math.random() * 5 + 5,
        yOffset: 0,
        scale: 1,
        bounceSpeed: Math.random() * 0.025 + 0.015 // Slower bounce for 2-5 hops
    });

    setTimeout(() => {
        state.environmentalEffects.tumbleweeds = [];
    }, TUMBLEWEED_DURATION);
}

function startSandGust() {
    if (state.environmentalEffects.sandGrains.length > 0) return;
    console.log("-> DEBUG: Starting sand gust.");
    for (let i = 0; i < SAND_GUST_PARTICLES; i++) {
        state.environmentalEffects.sandGrains.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 10 + 10,
            opacity: Math.random() * 0.3 + 0.1
        });
    }

    setTimeout(() => {
        state.environmentalEffects.sandGrains = [];
    }, SAND_GUST_DURATION);
}

function startTornado() {
    if (state.environmentalEffects.tornadoes.length > 0) return;
    console.log("-> DEBUG: Starting tornado.");

    const tornado = {
        x: Math.random() * canvas.width,
        startTime: Date.now(),
        duration: TORNADO_DURATION,
        maxWidth: Math.random() * 80 + 60,
        particles: []
    };

    for (let i = 0; i < TORNADO_PARTICLE_COUNT; i++) {
        tornado.particles.push({
            angle: Math.random() * 360,
            radius: Math.random() * tornado.maxWidth,
            y: canvas.height,
            speed: Math.random() * 2 + 1,
            yVelocity: -(Math.random() * 2 + 1),
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.4 + 0.2
        });
    }
    state.environmentalEffects.tornadoes.push(tornado);
}


function updateDesertThemeEffects(deltaTime) {
    // Update Tumbleweeds
    for (const tumbleweed of state.environmentalEffects.tumbleweeds) {
        tumbleweed.x += tumbleweed.speedX;
        tumbleweed.rotation += tumbleweed.rotationSpeed;
        tumbleweed.yOffset = Math.sin(tumbleweed.x * tumbleweed.bounceSpeed) * 20;
        tumbleweed.scale = 1 + Math.sin(tumbleweed.x * tumbleweed.bounceSpeed) * 0.2;
    }

    // Update Sand Grains
    for (const grain of state.environmentalEffects.sandGrains) {
        grain.x += grain.speedX;
        if (grain.x > canvas.width) {
            grain.x = 0;
        }
    }

    // Update Tornadoes
    if (state.frameCount % 2 === 0) { // Throttle the tornado update to every other frame
        for (let i = state.environmentalEffects.tornadoes.length - 1; i >= 0; i--) {
            const tornado = state.environmentalEffects.tornadoes[i];
            const elapsedTime = Date.now() - tornado.startTime;

            if (elapsedTime > tornado.duration) {
                state.environmentalEffects.tornadoes.splice(i, 1);
                continue;
            }

            for (const particle of tornado.particles) {
                particle.angle += particle.speed;
                particle.y += particle.yVelocity;

                // Funnel shape logic
                const heightRatio = (canvas.height - particle.y) / canvas.height;
                const currentRadius = particle.radius * heightRatio;

                particle.x = tornado.x + Math.cos(particle.angle * Math.PI / 180) * currentRadius;

                // Reset particle if it goes off the top
                if (particle.y < 0) {
                    particle.y = canvas.height;
                }
            }
        }
    }
}

function drawDesertThemeEffects() {
    // Draw Tumbleweeds
    for (const tumbleweed of state.environmentalEffects.tumbleweeds) {
        ctx.save();
        ctx.translate(tumbleweed.x, tumbleweed.y + tumbleweed.yOffset);
        ctx.scale(tumbleweed.scale, tumbleweed.scale);
        ctx.rotate(tumbleweed.rotation * Math.PI / 180);
        ctx.fillStyle = '#A0522D'; // Lighter brown
        ctx.beginPath();
        ctx.arc(0, 0, tumbleweed.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner spiral
        ctx.strokeStyle = '#8B4513'; // Darker brown for contrast
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 360; i++) {
            const angle = i * Math.PI / 180;
            const radius = tumbleweed.size * (i / 360);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    // Draw Sand Grains
    for (const grain of state.environmentalEffects.sandGrains) {
        ctx.save();
        ctx.fillStyle = `rgba(210, 180, 140, ${grain.opacity})`;
        ctx.fillRect(grain.x, grain.y, grain.size, grain.size);
        ctx.restore();
    }

    // Draw Tornadoes
    for (const tornado of state.environmentalEffects.tornadoes) {
        for (const particle of tornado.particles) {
            ctx.save();
            ctx.fillStyle = `rgba(210, 180, 140, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// --- OuterSpace Theme Effects ---

const ASTEROID_COUNT = 15;

const ASTEROID_DURATION = 10000; // 10 seconds

const SHOOTING_STAR_DURATION = 1000; // 1 second

const STAR_BURST_PARTICLE_COUNT = 20;

const STAR_TRAIL_PARTICLE_COUNT = 3;

const NEBULA_CLOUD_COUNT = 3;

const NEBULA_MAX_OPACITY = 0.1;

const NEBULA_FADE_IN_DURATION = 1000; // 1 second

const NEBULA_IDLE_DURATION = 10000; // 10 seconds

const NEBULA_FADE_OUT_DURATION = 4000; // 4 seconds

const NEBULA_TOTAL_DURATION = NEBULA_FADE_IN_DURATION + NEBULA_IDLE_DURATION + NEBULA_FADE_OUT_DURATION;

function startAsteroidField() {
    if (state.environmentalEffects.asteroids.length > 0) return;
    console.log("-> DEBUG: Starting asteroid field.");
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        const depth = Math.random();
        state.environmentalEffects.asteroids.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: (Math.random() * 15 + 5) * depth,
            speedX: (Math.random() * 1 + 0.5) * (1 - depth), // Slower for distant asteroids
            rotation: 0,
            rotationSpeed: Math.random() * 2 - 1,
            opacity: depth * 0.5 + 0.3
        });
    }
    setTimeout(() => {
        state.environmentalEffects.asteroids = [];
    }, ASTEROID_DURATION);
}

function startShootingStar() {
    if (state.environmentalEffects.shootingStars.length > 0) return;
    console.log("-> DEBUG: Starting shooting star.");
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height / 2;
    state.environmentalEffects.shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 100 + 50,
        speedX: - (Math.random() * 15 + 10),
        speedY: Math.random() * 10 + 5,
        opacity: 1.0,
        life: 1.0
    });
    setTimeout(() => {
        state.environmentalEffects.shootingStars = [];
    }, SHOOTING_STAR_DURATION);
}

function createStarBurst(x, y) {
    console.log("-> DEBUG: Creating star burst.");
    for (let i = 0; i < STAR_BURST_PARTICLE_COUNT; i++) {
        const angle = Math.random() * 360;
        const speed = Math.random() * 2 + 1;
        state.environmentalEffects.shootingStarBursts.push({
            x: x,
            y: y,
            speedX: Math.cos(angle * Math.PI / 180) * speed,
            speedY: Math.sin(angle * Math.PI / 180) * speed,
            size: Math.random() * 2 + 1,
            life: 1.0,
            opacity: 1.0
        });
    }
}

function createStarTrail(x, y) {
    for (let i = 0; i < STAR_TRAIL_PARTICLE_COUNT; i++) {
        state.environmentalEffects.shootingStarTrails.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            size: Math.random() * 1.5 + 0.5,
            life: 1.0,
            opacity: 1.0
        });
    }
}

function startNebulaCloud() {
    if (state.environmentalEffects.nebulaCloudState.active) return;
    console.log("-> DEBUG: Starting nebula cloud.");

    state.environmentalEffects.nebulaCloudState.active = true;
    state.environmentalEffects.nebulaCloudState.startTime = Date.now();

    const colors = ['138, 43, 226', '0, 191, 255', '255, 20, 147']; // RGB strings
    for (let i = 0; i < NEBULA_CLOUD_COUNT; i++) {
        state.environmentalEffects.nebulaClouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radiusX: Math.random() * 300 + 200,
            radiusY: Math.random() * 150 + 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 0.2 - 0.1
        });
    }
}

function updateOuterSpaceThemeEffects(deltaTime) {
    // Update Asteroids
    for (const asteroid of state.environmentalEffects.asteroids) {
        asteroid.x += asteroid.speedX;
        asteroid.rotation += asteroid.rotationSpeed;
        if (asteroid.x > canvas.width + asteroid.size) {
            asteroid.x = -asteroid.size;
        }
    }

    // Update Shooting Stars
    for (let i = state.environmentalEffects.shootingStars.length - 1; i >= 0; i--) {
        const star = state.environmentalEffects.shootingStars[i];
        star.x += star.speedX;
        star.y += star.speedY;
        star.life -= 0.02;
        star.opacity = star.life;

        createStarTrail(star.x, star.y);

        if (star.life <= 0) {
            if (Math.random() < 0.5) { // 50% chance of a burst
                createStarBurst(star.x, star.y);
            }
            state.environmentalEffects.shootingStars.splice(i, 1);
        }
    }

    // Update Star Bursts
    for (let i = state.environmentalEffects.shootingStarBursts.length - 1; i >= 0; i--) {
        const particle = state.environmentalEffects.shootingStarBursts[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.04; // Faster fade
        particle.opacity = particle.life;
        if (particle.life <= 0) {
            state.environmentalEffects.shootingStarBursts.splice(i, 1);
        }
    }

    // Update Star Trails
    for (let i = state.environmentalEffects.shootingStarTrails.length - 1; i >= 0; i--) {
        const particle = state.environmentalEffects.shootingStarTrails[i];
        particle.life -= 0.05; // Even faster fade for trails
        particle.opacity = particle.life;
        if (particle.life <= 0) {
            state.environmentalEffects.shootingStarTrails.splice(i, 1);
        }
    }

    // Update Nebula Clouds
    if (state.environmentalEffects.nebulaCloudState.active) {
        const cloudState = state.environmentalEffects.nebulaCloudState;
        const elapsedTime = Date.now() - cloudState.startTime;

        if (elapsedTime < NEBULA_FADE_IN_DURATION) {
            // Fading in
            cloudState.opacity = (elapsedTime / NEBULA_FADE_IN_DURATION) * NEBULA_MAX_OPACITY;
        } else if (elapsedTime < NEBULA_FADE_IN_DURATION + NEBULA_IDLE_DURATION) {
            // Idle
            cloudState.opacity = NEBULA_MAX_OPACITY;
        } else if (elapsedTime < NEBULA_TOTAL_DURATION) {
            // Fading out
            const fadeOutElapsedTime = elapsedTime - (NEBULA_FADE_IN_DURATION + NEBULA_IDLE_DURATION);
            cloudState.opacity = (1 - (fadeOutElapsedTime / NEBULA_FADE_OUT_DURATION)) * NEBULA_MAX_OPACITY;
        } else {
            // End of life
            cloudState.active = false;
            state.environmentalEffects.nebulaClouds = [];
        }

        for (const cloud of state.environmentalEffects.nebulaClouds) {
            cloud.x += cloud.speedX;
            if (cloud.x > canvas.width + cloud.radiusX) {
                cloud.x = -cloud.radiusX;
            }
        }
    }
}

function drawOuterSpaceThemeEffects() {
    // Draw Nebula Clouds
    if (state.environmentalEffects.nebulaCloudState.active) {
        const opacity = state.environmentalEffects.nebulaCloudState.opacity;
        for (const cloud of state.environmentalEffects.nebulaClouds) {
            ctx.save();
            ctx.fillStyle = `rgba(${cloud.color}, ${opacity})`;
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.radiusX, cloud.radiusY, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    // Draw Asteroids
    for (const asteroid of state.environmentalEffects.asteroids) {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation * Math.PI / 180);
        ctx.fillStyle = `rgba(128, 128, 128, ${asteroid.opacity})`;
        ctx.beginPath();
        ctx.arc(0, 0, asteroid.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Draw Star Trails
    for (const particle of state.environmentalEffects.shootingStarTrails) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Draw Shooting Stars
    for (const star of state.environmentalEffects.shootingStars) {
        ctx.save();
        const gradient = ctx.createLinearGradient(star.x, star.y, star.x + star.length, star.y - star.length / 2);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length, star.y - star.length / 2);
        ctx.stroke();
        ctx.restore();
    }

    // Draw Star Bursts
    for (const particle of state.environmentalEffects.shootingStarBursts) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- Night Theme Effects ---

const FIREFLY_COUNT = 20;
const FIREFLY_DURATION = 15000; // 15 seconds
const MOON_GLOW_FADE_DURATION = 5000; // 5 seconds
const MOON_GLOW_IDLE_DURATION = 10000; // 10 seconds
const MOON_GLOW_TOTAL_DURATION = MOON_GLOW_FADE_DURATION * 2 + MOON_GLOW_IDLE_DURATION;
const MOON_RAY_COUNT = 5;

function startFireflies() {
    if (state.environmentalEffects.fireflies.length > 0) return;
    console.log("-> DEBUG: Starting fireflies.");
    for (let i = 0; i < FIREFLY_COUNT; i++) {
        state.environmentalEffects.fireflies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: 0,
            fadeDirection: 1,
            fadeSpeed: Math.random() * 0.02 + 0.01
        });
    }
    setTimeout(() => {
        state.environmentalEffects.fireflies = [];
    }, FIREFLY_DURATION);
}

function startMoonGlow() {
    if (state.environmentalEffects.moonGlow.active) return;
    console.log("-> DEBUG: Starting moon glow.");
    const glowState = state.environmentalEffects.moonGlow;
    glowState.active = true;
    glowState.startTime = Date.now();
    glowState.rays = []; // Clear old rays

    for (let i = 0; i < MOON_RAY_COUNT; i++) {
        glowState.rays.push({
            x: Math.random() * canvas.width,
            width: Math.random() * 15 + 5,
            initialOpacity: Math.random() * 0.05 + 0.02
        });
    }
}

function updateNightThemeEffects(deltaTime) {
    // Update Fireflies
    for (const fly of state.environmentalEffects.fireflies) {
        fly.x += fly.speedX;
        fly.y += fly.speedY;

        // Drifting boundary check
        if (fly.x < 0 || fly.x > canvas.width) fly.speedX *= -1;
        if (fly.y < 0 || fly.y > canvas.height) fly.speedY *= -1;

        // Pulsing opacity
        fly.opacity += fly.fadeSpeed * fly.fadeDirection;
        if (fly.opacity > 1) { fly.opacity = 1; fly.fadeDirection = -1; }
        if (fly.opacity < 0) { fly.opacity = 0; fly.fadeDirection = 1; }
    }

    // Update Moon Glow
    const glowState = state.environmentalEffects.moonGlow;
    if (glowState.active) {
        const elapsedTime = Date.now() - glowState.startTime;
        if (elapsedTime < MOON_GLOW_FADE_DURATION) {
            // Fade in
            glowState.opacity = (elapsedTime / MOON_GLOW_FADE_DURATION);
        } else if (elapsedTime < MOON_GLOW_FADE_DURATION + MOON_GLOW_IDLE_DURATION) {
            // Idle
            glowState.opacity = 1.0;
        } else if (elapsedTime < MOON_GLOW_TOTAL_DURATION) {
            // Fade out
            const fadeOutTime = elapsedTime - (MOON_GLOW_FADE_DURATION + MOON_GLOW_IDLE_DURATION);
            glowState.opacity = 1.0 - (fadeOutTime / MOON_GLOW_FADE_DURATION);
        } else {
            glowState.active = false;
        }
    }
}

function drawNightThemeEffects() {
    // Draw Fireflies
    for (const fly of state.environmentalEffects.fireflies) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 0, ${fly.opacity})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size, 0, Math.PI * 2);
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'yellow';
        ctx.fill();
        ctx.restore();
    }

    // Draw Moon Glow and Rays
    const glowState = state.environmentalEffects.moonGlow;
    if (glowState.active) {
        // Draw main glow
        const gradient = ctx.createRadialGradient(canvas.width / 2, -100, 100, canvas.width / 2, 100, 400);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 * glowState.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw rays
        for (const ray of glowState.rays) {
            const rayGradient = ctx.createLinearGradient(ray.x, 0, ray.x, canvas.height);
            const finalOpacity = ray.initialOpacity * glowState.opacity * (0.5 + Math.sin(Date.now() / 1000) * 0.5); // Shimmer
            rayGradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
            rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = rayGradient;
            ctx.fillRect(ray.x - ray.width / 2, 0, ray.width, canvas.height);
        }
    }
}

// --- Volcano Theme Effects ---

const SMOKE_PARTICLE_COUNT = 25;
const SMOKE_DURATION = 20000; // 20 seconds
const EMBER_COUNT = 15;
const ASH_DENSITY = 100;
const ASH_DURATION = 10000; // 10 seconds
const EMBER_SHOWER_COUNT = 50;
const EMBER_SHOWER_DURATION = 3000; // 3 seconds
const STEAM_VENT_COUNT = 5;
const STEAM_PARTICLE_COUNT = 10;
const STEAM_DURATION = 5000; // 5 seconds

function startVolcanoSmoke() {
    if (state.environmentalEffects.volcanoSmoke.length > 0) return;
    console.log("-> DEBUG: Starting volcano smoke.");
    for (let i = 0; i < SMOKE_PARTICLE_COUNT; i++) {
        state.environmentalEffects.volcanoSmoke.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height,
            radiusX: Math.random() * 80 + 40,
            radiusY: Math.random() * 30 + 20,
            speedY: - (Math.random() * 0.5 + 0.2),
            speedX: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.2 + 0.1,
            life: 1.0
        });
    }
    // Also start some embers within the smoke
    for (let i = 0; i < EMBER_COUNT; i++) {
        state.environmentalEffects.embers.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 150,
            y: canvas.height,
            size: Math.random() * 3 + 1,
            speedY: - (Math.random() * 1 + 0.5),
            speedX: Math.random() * 1 - 0.5,
            life: 1.0,
            opacity: 1.0
        });
    }
    setTimeout(() => {
        state.environmentalEffects.volcanoSmoke = [];
        state.environmentalEffects.embers = [];
    }, SMOKE_DURATION);
}

function startAshfall() {
    if (state.environmentalEffects.ash.length > 0) return;
    console.log("-> DEBUG: Starting ashfall.");
    for (let i = 0; i < ASH_DENSITY; i++) {
        state.environmentalEffects.ash.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            size: Math.random() * 2 + 1,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 0.5 - 0.25
        });
    }
    setTimeout(() => {
        state.environmentalEffects.ash = [];
    }, ASH_DURATION);
}

function startHeatShimmer() {
    if (!state.environmentalEffects.heatShimmer.active) {
        console.log("-> DEBUG: Starting heat shimmer.");
        state.environmentalEffects.heatShimmer.active = true;
        setTimeout(() => {
            state.environmentalEffects.heatShimmer.active = false;
        }, 10000); // 10 seconds duration
    }
}

function startEmberShower() {
    if (state.environmentalEffects.embers.length > EMBER_COUNT) return; // Prevent overlap with smoke embers
    console.log("-> DEBUG: Starting ember shower.");
    for (let i = 0; i < EMBER_SHOWER_COUNT; i++) {
        state.environmentalEffects.embers.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -50,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * 2 + 1,
            speedX: 0,
            life: 1.0,
            opacity: 1.0
        });
    }
    // Also trigger some steam vents
    for (let i = 0; i < STEAM_VENT_COUNT; i++) {
        const ventX = Math.random() * canvas.width;
        for (let j = 0; j < STEAM_PARTICLE_COUNT; j++) {
            state.environmentalEffects.steamVents.push({
                x: ventX + (Math.random() - 0.5) * 20,
                y: canvas.height,
                radius: Math.random() * 10 + 5,
                speedY: -(Math.random() * 1 + 0.5),
                life: 1.0,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }
    setTimeout(() => {
        state.environmentalEffects.steamVents = [];
    }, STEAM_DURATION);
}

function updateVolcanoThemeEffects(deltaTime) {
    // Update Smoke
    for (let i = state.environmentalEffects.volcanoSmoke.length - 1; i >= 0; i--) {
        const smoke = state.environmentalEffects.volcanoSmoke[i];
        smoke.x += smoke.speedX;
        smoke.y += smoke.speedY;
        smoke.life -= 0.001;
        if (smoke.life <= 0) {
            state.environmentalEffects.volcanoSmoke.splice(i, 1);
        }
    }

    // Update Embers (from both smoke and showers)
    for (let i = state.environmentalEffects.embers.length - 1; i >= 0; i--) {
        const ember = state.environmentalEffects.embers[i];
        ember.x += ember.speedX;
        ember.y += ember.speedY;
        ember.life -= 0.01;
        ember.opacity = ember.life;
        if (ember.life <= 0) {
            state.environmentalEffects.embers.splice(i, 1);
        }
    }

    // Update Ash
    for (const ash of state.environmentalEffects.ash) {
        ash.y += ash.speedY;
        ash.x += ash.speedX;
        if (ash.y > canvas.height) {
            ash.y = 0;
            ash.x = Math.random() * canvas.width;
        }
    }

    // Update Steam Vents
    for (let i = state.environmentalEffects.steamVents.length - 1; i >= 0; i--) {
        const steam = state.environmentalEffects.steamVents[i];
        steam.y += steam.speedY;
        steam.life -= 0.015;
        steam.opacity = steam.life * 0.3;
        if (steam.life <= 0) {
            state.environmentalEffects.steamVents.splice(i, 1);
        }
    }

    // Update Heat Shimmer
    if (state.environmentalEffects.heatShimmer.active) {
        state.environmentalEffects.heatShimmer.waveY = (state.environmentalEffects.heatShimmer.waveY + 0.5) % 20;
    }
}

function drawVolcanoThemeEffects() {
    // Draw Smoke
    for (const smoke of state.environmentalEffects.volcanoSmoke) {
        ctx.save();
        ctx.fillStyle = `rgba(50, 50, 50, ${smoke.opacity * smoke.life})`;
        ctx.beginPath();
        ctx.ellipse(smoke.x, smoke.y, smoke.radiusX, smoke.radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }

    // Draw Ash
    for (const ash of state.environmentalEffects.ash) {
        ctx.save();
        ctx.fillStyle = `rgba(20, 20, 20, 0.5)`;
        ctx.fillRect(ash.x, ash.y, ash.size, ash.size);
        ctx.restore();
    }

    // Draw Embers
    for (const ember of state.environmentalEffects.embers) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 100, 0, ${ember.opacity})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'red';
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Draw Steam Vents
    for (const steam of state.environmentalEffects.steamVents) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${steam.opacity})`;
        ctx.beginPath();
        ctx.arc(steam.x, steam.y, steam.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Apply Heat Shimmer to the whole canvas if active
    if (state.environmentalEffects.heatShimmer.active) {
        const waveY = state.environmentalEffects.heatShimmer.waveY;
        for (let y = 0; y < canvas.height; y += 20) {
            const xOffset = Math.sin((y + waveY) * 0.1) * 5;
            ctx.drawImage(canvas, 0, y, canvas.width, 20, xOffset, y, canvas.width, 20);
        }
    }
}


// --- Manager Functions ---

export function updateEnvironmentalEffects(deltaTime) {
    switch (state.selectedTheme) {
        case 'grass':
            updateGrassThemeEffects(deltaTime);
            // Trigger rain randomly during gameplay
            if (Math.random() < 0.001 && state.gameRunning) {
                startRainShower();
            }
            break;
        case 'mountains':
            updateMountainsThemeEffects(deltaTime);
            // Trigger rockslide randomly during gameplay
            if (Math.random() < 0.001 && state.gameRunning) { // Less frequent rockslides
                startRockslide();
            }
            break;
        case 'roadway':
            updateRoadwayThemeEffects(deltaTime);
            // Trigger headlights randomly
            if (Math.random() < 0.001 && state.gameRunning) { // More frequent
                startHeadlights();
            }
            // Trigger fog randomly
            if (Math.random() < 0.002 && state.gameRunning) { // Even more frequent fog
                startFog();
            }
            break;
        case 'snow':
            updateSnowThemeEffects(deltaTime);
            // Trigger snowfall randomly during gameplay
            if (Math.random() < 0.0008 && state.gameRunning) {
                startSnowfall();
            }
            // Trigger wind gust randomly
            if (Math.random() < 0.001 && state.gameRunning) {
                startWindGust();
            }
            break;
case 'desert':
            updateDesertThemeEffects(deltaTime);
            // Trigger tumbleweed randomly
            if (Math.random() < 0.001 && state.gameRunning) {
                startTumbleweed();
            }
            // Trigger sand gust randomly
            if (Math.random() < 0.0005 && state.gameRunning) {
                startSandGust();
            }
            // Trigger tornado randomly
            if (Math.random() < 0.0002 && state.gameRunning) {
                startTornado();
            }
            break;
        case 'outerspace':
            updateOuterSpaceThemeEffects(deltaTime);
            // Trigger effects randomly
            if (Math.random() < 0.001 && state.gameRunning) {
                startAsteroidField();
            }
            if (Math.random() < 0.002 && state.gameRunning) {
                startShootingStar();
            }
            if (Math.random() < 0.0005 && state.gameRunning) {
                startNebulaCloud();
            }
            break;
        case 'night':
            updateNightThemeEffects(deltaTime);
            // Trigger effects randomly
            if (Math.random() < 0.002 && state.gameRunning) {
                startFireflies();
            }
            if (Math.random() < 0.0008 && state.gameRunning) {
                startMoonGlow();
            }
            break;
        case 'volcano':
            updateVolcanoThemeEffects(deltaTime);
            // Trigger effects randomly
            if (Math.random() < 0.001 && state.gameRunning) startVolcanoSmoke();
            if (Math.random() < 0.002 && state.gameRunning) startAshfall();
            if (Math.random() < 0.0005 && state.gameRunning) startHeatShimmer();
            if (Math.random() < 0.0015 && state.gameRunning) startEmberShower();
            break;
    }
}

/**
 * Manages drawing all environmental effects.
 * Called from the main draw() loop.
 */
export function drawEnvironmentalEffects() {
    switch (state.selectedTheme) {
        case 'grass':
            drawGrassThemeEffects();
            break;
        case 'mountains':
            drawMountainsThemeEffects();
            break;
        case 'roadway':
            updateRoadwayThemeEffects(0); // Pass 0 for deltaTime as it's already handled in the main loop
            drawRoadwayThemeEffects();
            break;
        case 'snow':
            drawSnowThemeEffects();
            break;
        case 'desert':
            drawDesertThemeEffects();
            break;
        case 'outerspace':
            drawOuterSpaceThemeEffects();
            break;
        case 'night':
            drawNightThemeEffects();
            break;
        case 'volcano':
            drawVolcanoThemeEffects();
            break;
    }
}