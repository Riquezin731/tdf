package com.yourname.game;

import java.util.ArrayList;
import java.util.List;

public class Game implements Runnable {
    private boolean running = true;
    private Player player;
    private MapData map;
    private List<Enemy> enemies = new ArrayList<>();

    public Game() {
        int[][] m = { /* copie sua matriz de tiles aqui */ };
        map = new MapData(m, 64);
        player = new Player(160, 160, 0);
        enemies.add(new Enemy(416,160,Math.PI,50));
    }

    public void run() {
        long last = System.nanoTime();
        while (running) {
            long now = System.nanoTime();
            double dt = (now - last) / 1e9;
            last = now;
            update(dt);
            render(); // implemente renderização usando JavaFX/libGDX/Canvas
            try { Thread.sleep(16); } catch (InterruptedException e) { }
        }
    }

    private void update(double dt) {
        for (Enemy e : enemies) e.update(player, map, dt);
    }

    private void render() {
        // aqui chama o Renderer que fará raycast e desenho
    }
}
