
// Raycast FPS demo (inspirado no estilo 90s) - original assets only
const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');

let W, H;
function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
addEventListener('resize', resize);
resize();

// Simple map (0 = empty, 1/2/3 = wall types)
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,3,3,3,0,2,0,0,0,1],
  [1,0,0,3,0,3,0,2,0,0,0,1],
  [1,0,0,3,3,3,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
];

const TILE = 64;
const MAP_W = MAP[0].length;
const MAP_H = MAP.length;

// Player
const player = {
  x: TILE * 2.5,
  y: TILE * 2.5,
  dir: 0, // radians
  fov: Math.PI / 3,
  speed: 160,
};

// Input
const keys = {};
addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Pointer lock for mouse look
canvas.onclick = () => canvas.requestPointerLock();
addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    addEventListener('mousemove', onMouseMove);
  } else {
    removeEventListener('mousemove', onMouseMove);
  }
});
function onMouseMove(e){
  player.dir += e.movementX * -0.002;
}

// Raycasting render
function render(){
  ctx.fillStyle = '#222';
  ctx.fillRect(0,0,W,H/2); // ceiling
  ctx.fillStyle = '#111';
  ctx.fillRect(0,H/2,W,H/2); // floor

  const numRays = W;
  const halfH = H/2;
  const rayStep = player.fov / numRays;
  let rayAngle = player.dir - (player.fov/2);

  for(let i=0;i<numRays;i++, rayAngle += rayStep){
    let rayX = Math.cos(rayAngle);
    let rayY = Math.sin(rayAngle);

    let distance = 0;
    let hit = false;
    let wallType = 0;

    while(!hit && distance < 1200){
      distance += 4;
      const testX = Math.floor((player.x + rayX * distance) / TILE);
      const testY = Math.floor((player.y + rayY * distance) / TILE);

      if(testX < 0 || testX >= MAP_W || testY < 0 || testY >= MAP_H){
        hit = true;
        distance = 1200;
        break;
      }
      const cell = MAP[testY][testX];
      if(cell !== 0){
        hit = true;
        wallType = cell;
      }
    }

    // remove fish-eye
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

  // Simple weapon HUD (center)
  const gunW = W/3 | 0;
  const gunH = H/3 | 0;
  ctx.fillStyle = '#222';
  ctx.fillRect((W-gunW)/2, H - gunH - 20, gunW, gunH);
  ctx.fillStyle = '#444';
  ctx.fillRect((W-gunW)/2 + 10, H - gunH - 10, gunW - 20, gunH - 20);
}

// Movement and update
let last = performance.now();
function loop(now){
  const dt = Math.min(0.05, (now - last)/1000);
  last = now;

  // Movement input: WASD
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
    // simple collision with map walls
    if(!isWall(nx, player.y)) player.x = nx;
    if(!isWall(player.x, ny)) player.y = ny;
  }

  // rotate with arrow keys
  if(keys['arrowleft']) player.dir -= 2.5 * dt;
  if(keys['arrowright']) player.dir += 2.5 * dt;

  render();
  requestAnimationFrame(loop);
}
function isWall(px, py){
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  if(tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return true;
  return MAP[ty][tx] !== 0;
}

requestAnimationFrame(loop);
