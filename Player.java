package com.yourname.game;

public class Player {
    public double x, y;
    public double dir;
    public double fov = Math.PI/3;
    public int health = 100;
    public int ammo = 50;
    public double speed = 160.0;

    public Player(double x, double y, double dir) {
        this.x = x; this.y = y; this.dir = dir;
    }

    public void move(double dx, double dy, MapData map, double dt) {
        double nx = x + dx * speed * dt;
        double ny = y + dy * speed * dt;
        if (!map.isWall(nx, y)) x = nx;
        if (!map.isWall(x, ny)) y = ny;
    }

    public void shootHitscan(MapData map, java.util.List<Enemy> enemies, AudioManager audio) {
        if (ammo <= 0) return;
        ammo--;
        audio.playShoot();
        double maxDist = 1200;
        double step = 4;
        double vx = Math.cos(dir);
        double vy = Math.sin(dir);
        double dist = 0;
        while (dist < maxDist) {
            dist += step;
            double tx = x + vx * dist;
            double ty = y + vy * dist;
            if (map.isWall(tx, ty)) break;
            for (Enemy e : enemies) {
                if (!e.alive) continue;
                double d = Math.hypot(e.x - tx, e.y - ty);
                if (d < 20) {
                    e.hp -= 35;
                    audio.playHit();
                    if (e.hp <= 0) e.alive = false;
                    return;
                }
            }
        }
    }
}
