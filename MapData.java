package com.yourname.game;

public class MapData {
    private int[][] map;
    private int tileSize;

    public MapData(int[][] map, int tileSize) {
        this.map = map;
        this.tileSize = tileSize;
    }

    public boolean isWall(double px, double py) {
        int tx = (int)Math.floor(px / tileSize);
        int ty = (int)Math.floor(py / tileSize);
        if (tx < 0 || ty < 0 || ty >= map.length || tx >= map[0].length) return true;
        return map[ty][tx] != 0;
    }

    public int[][] getMap(){ return map; }
    public int getTileSize(){ return tileSize; }
}
