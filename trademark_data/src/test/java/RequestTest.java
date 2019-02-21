import com.bjhy.trademark.common.net.WaitStrategy;
import com.bjhy.trademark.data.auto_word.WordComponent;
import com.bjhy.trademark.data.downloadPic.GetImageUrlTask;
import com.bjhy.trademark.data.downloadPic.GetImageSearchId;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.data.pic_orc.domain.Temp;
import com.bjhy.trademark.watermarker.WaterMarker;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Set;

/**
 * Create by: Jackson
 */
public class RequestTest {


    @Test
    public void show(){
        String annm = "1632";
        CloseableHttpClient client = HttpClients.createDefault();
        String searchId = new GetImageSearchId(annm).request(client);
        GetImageUrlTask getImageUrlTask = new GetImageUrlTask(client, new WaitStrategy() {
            @Override
            public long waitTime() {
                return 1000;
            }
        },1,20,searchId);
        Set<String> strings = getImageUrlTask.get();


    }

    @Test
    public void getDataPic(){
        WaterMarker waterMarker = new WaterMarker();
        try {
            waterMarker.getDataPic(new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg"),
                    new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void picOrc(){
        PicOrc picOrc = new PicOrc();
        File source = new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg");
        File targetFolder = new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources");
        WaterMarker waterMarker = new WaterMarker();

        File targetFile = new File(targetFolder,source.getName());

        try {
            waterMarker.getDataPic(source,targetFolder);
        } catch (IOException e) {
            e.printStackTrace();
        }

        OrcData normal = null;
        try {
            normal = picOrc.normal(targetFile.getAbsolutePath());
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println(normal);
    }

    @Test
    public void picOrc2(){
        PicOrc picOrc = new PicOrc();
        File source = new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg");
        File targetFolder = new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources");
        WaterMarker waterMarker = new WaterMarker();

        File targetFile = new File(targetFolder,source.getName());

        try {
            waterMarker.getDataPic(source,targetFolder);
        } catch (IOException e) {
            e.printStackTrace();
        }

        OrcData normal = null;
        try {
            normal = picOrc.gao(targetFile.getAbsolutePath());
        } catch (IOException e) {
            e.printStackTrace();
        }


        System.out.println(normal);
    }

    @Test
    public void picOrc3() {
        WaterMarker waterMarker = new WaterMarker();
        try {
            waterMarker.getDataPic(new File("/Users/jiaoyubing/downloadTemp3/1633/c7c34c39b282843a9eb9eff2c3693c22.jpg"),new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/logs"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    @Test
    public void date() throws ParseException {
        SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");

        WordComponent wordComponent = new WordComponent();
        String s = wordComponent.formatterDate(sf.parse("2018-12-01"));
        System.out.println(s);
    }


}
