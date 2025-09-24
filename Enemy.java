package com.yourname.game;

public class Enemy {
    public double x, y;
    public double dir;
    public int hp;
    public boolean alive = true;

    public Enemy(double x, double y, double dir, int hp) {
        this.x = x; this.y = y; this.dir = dir; this.hp = hp;
    }

    public void update(Player player, MapData map, double dt) {
        if (!alive) return;
        double dx = player.x - x, dy = player.y - y;
        double dist = Math.hypot(dx, dy);
        if (dist < 220) {
            x += (dx/dist) * 60 * dt;
            y += (dy/dist) * 60 * dt;
        } else {
            x += Math.cos(dir) * 20 * dt;
            y += Math.sin(dir) * 20 * dt;
            // bounce on wall
            if (map.isWall(x,y)) dir += Math.PI;
        }
    }
}

