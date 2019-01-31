package com.bjhy.trademark.data.core.net;

import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.net.WaitStrategy;
import com.bjhy.trademark.data.core.net.request.GetImageSearchId;
import com.bjhy.trademark.data.core.net.request.GetImageUrl;

import com.bjhy.trademark.data.domain.GetPicBean;
import org.apache.http.impl.client.CloseableHttpClient;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 指定任务区间进行下载 开始位 和结束位,根据配置的分组大小进行返回结果
 * Create by: Jackson
 */
public class GetImageUrlTask implements Runnable {


    WaitStrategy waitStrategy;
    CloseableHttpClient client;
    GetPicBeanCallBack callBack;
    int startNum;
    int endNum;
    String annm;

    public GetImageUrlTask(CloseableHttpClient client, GetPicBeanCallBack callBack, WaitStrategy waitStrategy, int startNum, int endNum,String annm) {
        this.client = client;
        this.callBack = callBack;
        this.waitStrategy = waitStrategy;
        this.startNum = startNum;
        this.endNum = endNum;
        this.annm = annm;

    }


    /**
     * @param urlList
     * @return 达到GROUP_COUNT数据量后进行返回
     */
    Set<String> imageUrlSet = new HashSet<>((endNum - startNum) + 10);

    private Set<String> addMemory(List<String> urlList) {
        if (urlList == null || urlList.size() == 0) return null;

        imageUrlSet.addAll(urlList);
        L.d("加入数据 当前数量为：", imageUrlSet.size());
        return imageUrlSet;
    }

    int start;
    int current;

    @Override
    public void run() {
        String searchId = new GetImageSearchId(annm).request(client);
        L.d("开始获取图片url");
        try {


            int pageSize = 20;
            int total = 30000;

            if (endNum > total) {
                endNum = total;
            }

            start = startNum;
            current = start;
            boolean isLast = false;
            while (!Thread.currentThread().isInterrupted()) {
                if (isLast) break;
                if (current > endNum) {
                    current = endNum - pageSize;
                    if (current < 1)
                        current = 1;
                    isLast = true;
                }
                Thread.sleep(waitStrategy.waitTime());
                L.d("发送请求号：", current);

                GetPicBean bean = new GetImageUrl(searchId, String.valueOf(current)).request(client);
                Set<String> urlSet = addMemory(bean.getImaglist());

                if (isLast) {
                    callBack.imageUrl(urlSet);
                    break;
                }
                current += pageSize;
            }
            L.d("获取图片url完成");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }


    public interface GetPicBeanCallBack {
        void imageUrl(Set<String> urlSet);
    }

}
