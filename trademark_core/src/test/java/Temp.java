import com.bjhy.jackson.fast.generator.CodeGenerator;
import com.bjhy.jackson.fast.generator.config.GeneratorConfig;
import com.bjhy.trademark.common.utils.ZipUtil;
import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.watermarker.WaterMarker;
import freemarker.template.TemplateException;
import org.junit.Test;

import javax.persistence.Table;
import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Create by: Jackson
 */
public class Temp {

    @Test
    public void regx(){
        String s = "第16645306号";
        System.out.println(s.matches("第\\d+号"));
    }



    @Test
    public void picOrc2() throws ParseException {
        PicOrc picOrc = new PicOrc();
        File source = new File(
                "/Users/jiaoyubing/Downloads/yBQCIFx09ayAOtx-AAOzODBnBHI755.jpg");
        File targetFolder = new File(
                "/Users/jiaoyubing/work_space/localworkspace/trademark_web/trademark_core/src/test/genertor");
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

        TrademarkBean trademarkBean = new TrademarkBean();
        ConvertUtil.convert(normal, trademarkBean);
        List<TrademarkBean.TrademarkType> trademarkType = trademarkBean.getTrademarkType();

        System.out.println(trademarkBean);


    }


/*    @Test
    public void normalTest() throws IOException {
        File source = new File(
                "/Users/jiaoyubing/work_space/localworkspace/trademark_web/trademark_core/src/test/genertor/a.jpg");
        PicOrc picOrc = new PicOrc();
        picOrc.initClient();
        OrcData normal = picOrc.normal(source.getAbsolutePath());
        TrademarkBean trademarkBean = new TrademarkBean();
        boolean convert = ConvertUtil.convert(normal, trademarkBean);

    }*/

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


    @Test
    public void zip() throws IOException {
        String zipfolder = "/Users/jiaoyubing/downloadTemp3/temp/1550466499373的副本";
        String targetPath = "/Users/jiaoyubing/downloadTemp3/temp";
        ZipUtil.directory2Zip(zipfolder,targetPath,"123.zip");
    }

    @Test
    public void inttest(){
        String rex = "(?<value>[\\d\\w]+)";
        String value= "12332A";
        Pattern compile = Pattern.compile(rex);
        Matcher matcher = compile.matcher(value);
        if(matcher.find()){
            System.out.println(matcher.group("value"));
        }
    }

}
