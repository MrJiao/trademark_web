import com.bjhy.jackson.fast.generator.CodeGenerator;
import com.bjhy.jackson.fast.generator.config.GeneratorConfig;
import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.watermarker.WaterMarker;
import freemarker.template.TemplateException;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.util.List;

/**
 * Create by: Jackson
 */
public class Temp {

    @Test
    public void regx(){
        TrademarkBean trademarkBean = new TrademarkBean();
        List<TrademarkBean.TrademarkType> trademarkType = trademarkBean.getTrademarkType();

    }



    @Test
    public void picOrc2() throws ParseException {
        PicOrc picOrc = new PicOrc();
        File source = new File("/Users/jiaoyubing/Downloads/yBQCH1xBTqCAd7MRAAM2VU13EPo202.jpg");
        File targetFolder = new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/remove_watermarker/src/main/resources");
        WaterMarker waterMarker = new WaterMarker();

        File targetFile = new File(targetFolder,source.getName());

        waterMarker.getDataPic(source,targetFolder);

        OrcData normal = picOrc.gao(targetFile.getAbsolutePath());

        TrademarkBean trademarkBean = new TrademarkBean();
        ConvertUtil.convert(normal, trademarkBean);
        List<TrademarkBean.TrademarkType> trademarkType = trademarkBean.getTrademarkType();

        System.out.println(trademarkBean);


    }

    @Test
    public void show() throws IOException, TemplateException {
        Class[] classes = { TrademarkBean.class, TaskData.class};
                /*CriminalType.class,
                DeliveryRule.class,
                HandoverRecord.class,
                Prison.class,
                Region.class};*/

        GeneratorConfig generatorConfig = new GeneratorConfig();
        generatorConfig.setUseNewJs(true);
        generatorConfig.setTargetPath("/Users/jiaoyubing/work_space/localworkspace/trademark_web/trademark_core/src/test/genertor");

        CodeGenerator codeGenerator = new CodeGenerator();
        codeGenerator.generatorCode(classes,generatorConfig);
    }

}
