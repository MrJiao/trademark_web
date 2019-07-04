package com.bjhy.trademark.watermarker.core;

import java.util.ArrayList;
import java.util.List;

/**
 * Create by: Jackson
 */
public class AreaCompont {
    List<Area> list = new ArrayList<>();

    //新版本
    public AreaCompont() {
        list.add(new Area(
                new Area.Point(93, 51),//左上
                new Area.Point(55, 105),//右上
                new Area.Point(617, 343),//左下
                new Area.Point(553, 389)));//右下
        list.add(new Area(
                new Area.Point(821, 57),
                new Area.Point(781, 99),
                new Area.Point(1189, 263),
                new Area.Point(1190, 335)));
        list.add(new Area(
                new Area.Point(931, 265),
                new Area.Point(71, 679),
                new Area.Point(615, 925),
                new Area.Point(575, 975)));
        list.add(new Area(
                new Area.Point(825, 623),
                new Area.Point(795, 681),
                new Area.Point(1190, 841),
                new Area.Point(1190, 907)));
        list.add(new Area(
                new Area.Point(83, 1212),
                new Area.Point(57, 1266),
                new Area.Point(599, 1514),
                new Area.Point(567, 1560)));

        list.add(new Area(
                new Area.Point(843, 1214),
                new Area.Point(811, 1264),
                new Area.Point(1190, 1414),
                new Area.Point(1190, 1480)));
    }
    //老版本
    /*public AreaCompont() {
        list.add(new Area(
                new Area.Point(94, 159),
                new Area.Point(628, 468),
                new Area.Point(67, 200),
                new Area.Point(601, 511)));

        list.add(new Area(
                new Area.Point(1001, 170),
                new Area.Point(1190, 275),
                new Area.Point(975, 213),
                new Area.Point(1190, 338)));
        list.add(new Area(
                new Area.Point(73, 650),
                new Area.Point(611, 953),
                new Area.Point(43, 698),
                new Area.Point(578, 1004)));
        list.add(new Area(
                new Area.Point(1015, 696),
                new Area.Point(1190, 793),
                new Area.Point(991, 744),
                new Area.Point(1190, 860)));
        list.add(new Area(
                new Area.Point(78, 1228),
                new Area.Point(620, 1540),
                new Area.Point(56, 1276),
                new Area.Point(594, 1584)));
        list.add(new Area(
                new Area.Point(1009, 1221),
                new Area.Point(1190, 1323),
                new Area.Point(988, 1271),
                new Area.Point(1190, 1390)));
    }*/

    public boolean isContains(int x,int y){
        for (Area area : list) {
            if(area.isPointInRect(x,y)){
                return true;
            }
        }
        return false;
    }
}
