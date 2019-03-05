import com.bjhy.trademark.watermarker.WaterMarker;
import org.junit.Test;

import java.io.File;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Create by: Jackson
 */
public class Temp {


    @Test
    public void getClip(){
        WaterMarker waterMarker = new WaterMarker();

        ArrayList<File> files = new ArrayList<>();
        files.add(new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg"));

        //waterMarker.clipPic(files,new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources"));
    }

    @Test
    public void getDataPic(){
        WaterMarker waterMarker = new WaterMarker();
    }


    @Test
    public void intd(){
        String a = getNum("第123 号");
        System.out.println(a);
    }


    private static String getNum(String words) {
        Pattern pattern = Pattern.compile("第\\s*(?<value>\\d+)\\s*号");
        Matcher matcher = pattern.matcher(words);
        matcher.matches();
        Matcher matcher2 = pattern.matcher(words);
        if(matcher2.find()){
            String num = matcher.group("value");
            return num;
        }
        return "";
    }

}
