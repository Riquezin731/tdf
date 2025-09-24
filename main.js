// main.js — RetroFPS raycast 2.5D com sprites, tiros e inimigos simples
// Estrutura modular mínima; coloque assets em /assets/ conforme README
const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');
const healthUI = document.getElementById('healthCount');
const ammoUI = document.getElementById('ammoCount');
const messageUI = document.getElementById('message');
const sfxShoot = document.getElementById('sfx-shoot');
const sfxHit = document.getElementById('sfx-hit');

let W, H;
function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
addEventListener('resize', resize);
resize();

// Map config (tile grid). 0 = empty, 1..n = wall types
const MAP = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,0,0,3,0,0,1],
  [1,0,0,0,2,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,0,0,3,0,0,1],
  [1,0,0,0,2,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];

const TILE = 64;
const MAP_W = MAP[0].length;
const MAP_H = MAP.length;

// Player
const player = {
  x: TILE * 2.5,
  y: TILE * 2.5,
  dir: 0,
  fov: Math.PI/3,
  speed: 160,
  health: 100,
  ammo: 50
};

// Enemies (simple): x,y,dir,hp,walkTimer
const enemies = [
  { x: TILE*6.5, y: TILE*2.5, dir: Math.PI, hp: 50, alive: true, anim:0 },
  { x: TILE*3.5, y: TILE*5.5, dir: 0, hp: 50, alive: true, anim:0 }
];

// Bullets (player)
const bullets = []; // {x,y,dx,dy,life,damage}

// Input
const keys = {};
addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Pointer and mouse
canvas.onclick = () => canvas.requestPointerLock();
addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) addEventListener('mousemove', onMouseMove);
  else removeEventListener('mousemove', onMouseMove);
});
function onMouseMove(e){ player.dir += e.movementX * -0.002; }

// Simple assets (sprites) loader
const IMG = {};
function loadImage(key, src){
  return new Promise(res => {
    const i = new Image();
    i.src = src;
    i.onload = () => { IMG[key]=i; res(i); };
    i.onerror = () => { console.warn('Failed load', src); res(null); };
  });
}
async function loadAssets(){
  await Promise.all([
    loadImage('player_gun','assets/sprites/player_gun.png'),
    loadImage('bullet','assets/sprites/bullet.png'),
    loadImage('enemy','assets/sprites/enemy_walk.png')
  ]);
}
loadAssets();

// Utility
function isWall(px, py){
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  if(tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return true;
  return MAP[ty][tx] !== 0;
}

// Raycast render with sprite projection
function render(){
  // sky & floor
  ctx.fillStyle = '#88aaff'; ctx.fillRect(0,0,W,H/2);
  ctx.fillStyle = '#444'; ctx.fillRect(0,H/2,W,H/2);

  const numRays = W;
  const halfH = H/2;
  const rayStep = player.fov / numRays;
  let rayAngle = player.dir - (player.fov/2);

  // walls: per-pixel vertical slices
  for(let i=0;i<numRays;i++, rayAngle += rayStep){
    const rayX = Math.cos(rayAngle);
    const rayY = Math.sin(rayAngle);
    let distance = 0;
    let hit = false;
    let wallType = 0;
    while(!hit && distance < 1400){
      distance += 4;
      const tx = Math.floor((player.x + rayX * distance) / TILE);
      const ty = Math.floor((player.y + rayY * distance) / TILE);
      if(tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H){ hit = true; distance = 1400; break; }
      const cell = MAP[ty][tx];
      if(cell !== 0){ hit = true; wallType = cell; }
    }

    const corrected = distance * Math.cos(rayAngle - player.dir);
    const wallHeight = Math.min(H*2, (TILE * 300) / (corrected + 0.0001));
    const shade = Math.max(0.2, 1 - (corrected / 900));
    let color;
    if(wallType === 1) color = `rgba(${200*shade|0},${50*shade|0},${50*shade|0},1)`;
    else if(wallType === 2) color = `rgba(${50*shade|0},${200*shade|0},${50*shade|0},1)`;
    else if(wallType === 3) color = `rgba(${50*shade|0},${50*shade|0},${200*shade|0},1)`;
    else color = `rgba(${120*shade|0},${120*shade|0},${120*shade|0},1)`;

    ctx.fillStyle = color;
    const x = i;
    const y = halfH - (wallHeight/2);
    ctx.fillRect(x, y, 1, wallHeight);
  }

  // Sprites (enemies)
  const spriteList = [];
  for(const e of enemies) if(e.alive){
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.hypot(dx,dy);
    const ang = Math.atan2(dy,dx);
    let rel = ang - player.dir;
    // normalize
    while(rel > Math.PI) rel -= Math.PI*2;
    while(rel < -Math.PI) rel += Math.PI*2;
    const inFov = Math.abs(rel) < (player.fov/2) + 0.5;
    if(inFov && dist > 0.1){
      spriteList.push({type:'enemy',dist,rel,e});
    }
  }
  // sort back->front
  spriteList.sort((a,b)=>b.dist-a.dist);

  for(const s of spriteList){
    const size = Math.min(W, (TILE*500) / s.dist);
    const screenX = (0.5 + (s.rel / player.fov)) * W;
    const img = IMG['enemy'];
    if(img){
      const sw = img.width;
      const sh = img.height;
      ctx.drawImage(img, (s.e.anim|0)*sw/4, 0, sw/4, sh, screenX - size/2, H/2 - size/2, size, size);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(screenX - size/4, H/2 - size/4, size/2, size/2);
    }
  }

  // Weapon (2D overlay)
  const gun = IMG['player_gun'];
  if(gun){
    const gw = W/2.8;
    const gh = gw * (gun.height/gun.width);
    ctx.drawImage(gun, (W-gw)/2, H - gh - 10, gw, gh);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(W/2 - 120, H - 180, 240, 160);
  }

  // Draw bullets (2D)
  for(const b of bullets){
    if(IMG['bullet']) ctx.drawImage(IMG['bullet'], b.x-6, b.y-6, 12, 12);
    else { ctx.fillStyle='yellow'; ctx.fillRect(b.x-3,b.y-3,6,6); }
  }
}

// Game loop: movement, bullets, collisions, enemy AI
let last = performance.now();
function loop(now){
  const dt = Math.min(0.05, (now - last)/1000);
  last = now;

  // player movement
  let mvx = 0, mvy = 0;
  if(keys['w']) { mvx += Math.cos(player.dir); mvy += Math.sin(player.dir); }
  if(keys['s']) { mvx -= Math.cos(player.dir); mvy -= Math.sin(player.dir); }
  if(keys['a']) { mvx += Math.cos(player.dir - Math.PI/2); mvy += Math.sin(player.dir - Math.PI/2); }
  if(keys['d']) { mvx += Math.cos(player.dir + Math.PI/2); mvy += Math.sin(player.dir + Math.PI/2); }

  const len = Math.hypot(mvx, mvy);
  if(len > 0){
    mvx /= len; mvy /= len;
    const nx = player.x + mvx * player.speed * dt;
    const ny = player.y + mvy * player.speed * dt;
    if(!isWall(nx, player.y)) player.x = nx;
    if(!isWall(player.x, ny)) player.y = ny;
  }

  if(keys['arrowleft']) player.dir -= 2.5 * dt;
  if(keys['arrowright']) player.dir += 2.5 * dt;

  // Fire (space or mouse)
  // Mouse button handled via pointer lock mouse click
  if(keys[' ']) { tryFire(); keys[' '] = false; }

  // Bullet logic (world-space, simple)
  for(let i = bullets.length-1; i>=0; i--){
    const b = bullets[i];
    b.x += b.dx * dt;
    b.y += b.dy * dt;
    b.life -= dt;
    // collide with wall
    if(isWall(b.x, b.y) || b.life <= 0){
      bullets.splice(i,1);
      continue;
    }
    // collide with enemies
    for(const e of enemies){
      if(!e.alive) continue;
      const dist = Math.hypot(e.x - b.x, e.y - b.y);
      if(dist < 22){
        e.hp -= b.damage;
        if(e.hp <= 0){ e.alive = false; sfxHit?.play(); showMessage('Enemy down'); }
        bullets.splice(i,1);
        sfxHit?.play();
        break;
      }
    }
  }

  // Enemies simple AI: wander and chase if close
  for(const e of enemies){
    if(!e.alive) continue;
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx,dy);
    e.anim += 6 * dt;
    if(dist < 220){
      // chase
      const nx = e.x + (dx/dist) * 60 * dt;
      const ny = e.y + (dy/dist) * 60 * dt;
      if(!isWall(nx, e.y)) e.x = nx;
      if(!isWall(e.x, ny)) e.y = ny;
      // damage player if very close
      if(dist < 22){
        player.health -= 20 * dt; // continuous damage
        if(player.health <= 0){ player.health = 0; showMessage('You died — reload page to retry'); }
      }
    } else {
      // wander: small back-and-forth
      e.x += Math.cos(e.dir) * 20 * dt;
      e.y += Math.sin(e.dir) * 20 * dt;
      e.walkTimer = (e.walkTimer || 0) + dt;
      if(e.walkTimer > 2){ e.dir += Math.PI * (Math.random()-0.5); e.walkTimer = 0; }
      if(isWall(e.x,e.y)){ e.dir += Math.PI; }
    }
  }

  // Update UI
  healthUI.textContent = Math.max(0, Math.floor(player.health));
  ammoUI.textContent = player.ammo;

  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Shooting handler
let lastShot = 0;
function tryFire(){
  const now = performance.now();
  if(now - lastShot < 150) return; // fire rate
  if(player.ammo <= 0){ showMessage('Out of ammo'); return; }
  player.ammo--;
  lastShot = now;
  // ray from player center to center screen
  const angle = player.dir;
  const speed = 900;
  // spawn bullet at player pos (screen-space for visual) but use world coords for collisions
  const bx = player.x + Math.cos(angle)*24;
  const by = player.y + Math.sin(angle)*24;
  bullets.push({ x: bx, y: by, dx: Math.cos(angle)*speed, dy: Math.sin(angle)*speed, life:1.5, damage:25 });
  sfxShoot?.play();
}

// Mouse click to shoot
addEventListener('mousedown', e => {
  if(document.pointerLockElement === canvas && e.button === 0) tryFire();
});

// helper message
let msgTimer = 0;
function showMessage(t, dur=1500){
  messageUI.textContent = t;
  msgTimer = dur;
  setTimeout(()=>{ messageUI.textContent = ''; }, dur);
}

// basic touch support: simple virtual joystick buttons (optional)
