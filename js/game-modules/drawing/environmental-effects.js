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
}

function drawRoadwayThemeEffects() {
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

// --- Placeholder for Space Theme ---
function updateSpaceThemeEffects(deltaTime) {}
function drawSpaceThemeEffects() {}



// --- Placeholder for Night Theme ---
function updateNightThemeEffects(deltaTime) {}
function drawNightThemeEffects() {}


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
            break;
        case 'space':
            updateSpaceThemeEffects(deltaTime);
            break;
        case 'night':
            updateNightThemeEffects(deltaTime);
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
        case 'space':
            drawSpaceThemeEffects();
            break;
        case 'night':
            drawNightThemeEffects();
            break;
    }
}

