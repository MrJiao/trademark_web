package com.bjhy.trademark.watermarker.core;

import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static com.bjhy.trademark.watermarker.Config.worldWidth;
import static java.math.BigDecimal.ROUND_HALF_DOWN;

/**
 * Create by: Jackson
 */
@Component
public class ImageComponent {

    public MyImage handle(File file) throws IOException {
        BufferedImage image = ImageIO.read(file);
        MyImage pic = remove(image);
        pic = clip(pic);
      //  pic = scale(pic);
        return pic;
    }



    public MyImage removeWarterMarker(File file) throws IOException {
        BufferedImage image = ImageIO.read(file);
        MyImage pic = remove(image);
        return pic;
    }

    public MyImage clipPic(File file) throws IOException {
        BufferedImage image = ImageIO.read(file);
        MyImage pic = remove(image);
        return clip(pic);
    }


    /**
     * 把商标切缩成小图
     *
     * @param pic
     * @return
     */
    private MyImage clip(MyImage pic) {
        CopyAreaCompont copyAreaCompont = new CopyAreaCompont();
        copyAreaCompont.init(pic);

        List<CopyArea> copyAreaList = copyAreaCompont.getCopyArea();
        BufferedImage removeBuf = pic.getOutput();

        MyImage clipImage = create(copyAreaCompont.getWidth(), copyAreaCompont.getHeight(), removeBuf.getType());
        clipImage.setBackGround(new Color(-1));
        for (CopyArea copyArea : copyAreaList) {
            BufferedImage subimage = removeBuf.getSubimage(copyArea.x, copyArea.y, copyArea.width, copyArea.height);
            clipImage.getGraphics().drawImage(subimage, copyArea.toX, copyArea.toY, null);
        }
        clipImage.getGraphics().dispose();
        return clipImage;
    }


    private MyImage scale(MyImage pic) {
        BigDecimal widthBig = new BigDecimal(pic.getOutput().getWidth());
        BigDecimal heightBig = new BigDecimal(pic.getOutput().getHeight());
        BigDecimal worldWidthBig = new BigDecimal(worldWidth);
        int worldHeight = heightBig.divide(widthBig, 5, ROUND_HALF_DOWN).multiply(worldWidthBig).intValue();

        MyImage myImage = create(worldWidth, worldHeight, pic.getOutput().getType());
        myImage.getGraphics().drawImage(pic.getOutput().getScaledInstance(worldWidth, worldHeight, Image.SCALE_SMOOTH), 0, 0, null);
        myImage.getGraphics().dispose();
        return myImage;
    }


    private MyImage create(int width, int height, int imageType) {
        BufferedImage output = new BufferedImage(width, height, imageType);
        Graphics2D graphics = output.createGraphics();
        return new MyImage(graphics, output);
    }

    /**
     * 去水印
     *
     * @param image
     * @return
     * @throws IOException
     */
    private MyImage remove(BufferedImage image) throws IOException {
        AreaCompont areaCompont = new AreaCompont();
        int height = image.getHeight();
        int width = image.getWidth();
        MyImage myImage = create(width, height, image.getType());
        int a = 200;
        myImage.getGraphics().drawImage(image, 0, 0, null); //画图
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                if (!areaCompont.isContains(i, j)) continue;
                int rgb = image.getRGB(i, j);
                Color color = new Color(rgb);
                int red = color.getRed();
                int blue = color.getBlue();
                int green = color.getGreen();
                if (red > a || blue > a || green > a) {
                    myImage.getOutput().setRGB(i, j, -1);

                }
            }
        }
        myImage.getGraphics().dispose();
        return myImage;
    }


    public static class MyImage {
        private Graphics2D graphics;
        private BufferedImage output;

        public MyImage(Graphics2D graphics, BufferedImage output) {
            this.graphics = graphics;
            this.output = output;
        }

        public Graphics2D getGraphics() {
            return graphics;
        }

        public BufferedImage getOutput() {
            return output;
        }

        public void setBackGround(Color color) {
            getGraphics().setColor(color);
            getGraphics().fillRect(0, 0, output.getWidth(), output.getHeight());
        }
    }

}
