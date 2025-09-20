export function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + (a.width || 0) > b.x &&
    a.y < b.y + b.height &&
    a.y + (a.height || 0) > b.y
  );
}
