package com.bjhy.trademark.watermarker.core;


import com.bjhy.tlevel.datax.common.utils.L;

import javax.imageio.ImageIO;
import java.io.File;
import java.io.IOException;
import java.util.Collection;

/**
 * Create by: Jackson
 */
public class Task extends Thread {

   /* Collection<File> fileList;
    ImageComponent imageComponent;
    public Task( Collection<File> list){
        this.fileList = list;
        imageComponent = new ImageComponent();
    }


    @Override
    public void run() {
        long start = System.currentTimeMillis();

        for (File file : fileList) {
            try {
                ImageComponent.MyImage image = imageComponent.handle(file);
                storeImage(image,file);
                L.d("处理完成:"+file.getName());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        long end = System.currentTimeMillis();
        System.out.println("总耗时 " + (end - start) / 1000 + " 秒");

    }

    private void storeImage(ImageComponent.MyImage image, File file) throws IOException {
        File resultFolder = new File(file.getParentFile(), "result");
        resultFolder.mkdir();
        File originFile = new File(resultFolder, file.getName());
        ImageIO.write(image.getOutput(), "jpg",originFile );
    }*/


}
