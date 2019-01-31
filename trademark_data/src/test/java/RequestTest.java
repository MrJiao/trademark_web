import com.bjhy.trademark.common.net.WaitStrategy;
import com.bjhy.trademark.data.core.net.GetImageUrlTask;
import com.bjhy.trademark.data.core.net.request.GetImageSearchId;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.Test;

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
        GetImageUrlTask getImageUrlTask = new GetImageUrlTask(client, new GetImageUrlTask.GetPicBeanCallBack() {
            @Override
            public void imageUrl(Set<String> urlSet) {

            }
        }, new WaitStrategy() {
            @Override
            public long waitTime() {
                return 1000;
            }
        },1,200,searchId);
        getImageUrlTask.run();


    }
}
