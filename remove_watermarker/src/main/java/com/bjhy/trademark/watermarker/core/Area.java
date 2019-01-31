package com.bjhy.trademark.watermarker.core;

/**
 * Create by: Jackson
 */
public class Area {

    Point leftTop;
    Point rightTop;
    Point leftBottom;
    Point rightBottom;

    public Area(Point leftTop, Point rightTop, Point leftBottom, Point rightBottom) {
        this.leftTop = leftTop;
        this.rightTop = rightTop;
        this.leftBottom = leftBottom;
        this.rightBottom = rightBottom;
    }

    public static class Point{
        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        int x;
        int y;
    }

    public boolean isPointInRect(int x, int y) {
        final Point A = leftBottom;
        final Point B = leftTop;
        final Point C = rightTop;
        final Point D = rightBottom;
        final int a = (B.x - A.x)*(y - A.y) - (B.y - A.y)*(x - A.x);
        final int b = (C.x - B.x)*(y - B.y) - (C.y - B.y)*(x - B.x);
        final int c = (D.x - C.x)*(y - C.y) - (D.y - C.y)*(x - C.x);
        final int d = (A.x - D.x)*(y - D.y) - (A.y - D.y)*(x - D.x);
        if((a > 0 && b > 0 && c > 0 && d > 0) || (a < 0 && b < 0 && c < 0 && d < 0)) {
            return true;
        }

//      AB X AP = (b.x - a.x, b.y - a.y) x (p.x - a.x, p.y - a.y) = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
//      BC X BP = (c.x - b.x, c.y - b.y) x (p.x - b.x, p.y - b.y) = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x);
        return false;
    }



}
