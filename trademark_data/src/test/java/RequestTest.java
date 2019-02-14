import com.bjhy.trademark.common.net.WaitStrategy;
import com.bjhy.trademark.data.downloadPic.GetImageUrlTask;
import com.bjhy.trademark.data.downloadPic.GetImageSearchId;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.watermarker.WaterMarker;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.Test;

import java.io.File;
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
        },1,200,searchId);
        Set<String> strings = getImageUrlTask.get();


    }

    @Test
    public void getDataPic(){
        WaterMarker waterMarker = new WaterMarker();
        waterMarker.getDataPic(new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg"),
                new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources"));
    }

    @Test
    public void picOrc(){
        PicOrc picOrc = new PicOrc();
        File source = new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg");
        File targetFolder = new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources");
        WaterMarker waterMarker = new WaterMarker();

        File targetFile = new File(targetFolder,source.getName());

        waterMarker.getDataPic(source,targetFolder);

        OrcData normal = picOrc.normal(targetFile.getAbsolutePath());
        System.out.println(normal);
    }

    @Test
    public void picOrc2(){
        PicOrc picOrc = new PicOrc();
        File source = new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg");
        File targetFolder = new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources");
        WaterMarker waterMarker = new WaterMarker();

        File targetFile = new File(targetFolder,source.getName());

        waterMarker.getDataPic(source,targetFolder);

        OrcData normal = picOrc.gao(targetFile.getAbsolutePath());



        System.out.println(normal);
    }


    @Test
    public void regx(){


    }


}
