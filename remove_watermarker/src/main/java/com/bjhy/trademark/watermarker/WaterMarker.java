package com.bjhy.trademark.watermarker;


import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.watermarker.core.ImageComponent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Create by: Jackson
 */
@Component
public class WaterMarker {

    @Autowired
    //ImageComponent imageComponent;
    ImageComponent imageComponent = new ImageComponent();
    public void removeWaterMarker(List<File> fileList,File folder){
        boolean mkdirs = folder.mkdirs();
        for (File file : fileList) {
            try {
                ImageComponent.MyImage image = imageComponent.removeWarterMarker(file);
                storeImage(image,new File(folder,file.getName()));
                L.d("处理完成:"+file.getName());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void clipPics(List<File> fileList,File folder){
        boolean mkdirs = folder.mkdirs();
        for (File file : fileList) {
            try {
                ImageComponent.MyImage image = imageComponent.clipPic(file);
                storeImage(image,new File(folder,file.getName()));
                L.d("处理完成:"+file.getName());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void clipPic(File file,File toFile){
        try {
            ImageComponent.MyImage image = imageComponent.clipPic(file);
            storeImage(image,toFile);
            L.d("处理完成:"+file.getName());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public void getDataPic(File file,File toFile){
        boolean mkdirs = toFile.getParentFile().mkdirs();
        try {
            ImageComponent.MyImage image = imageComponent.getDataPic(file);
            storeImage(image,toFile);
        } catch (IOException e) {
            L.exception(e);
        }
    }




    private void storeImage(ImageComponent.MyImage image, File file) throws IOException {
        ImageIO.write(image.getOutput(), "jpg",file );
    }


}
