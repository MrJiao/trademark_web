import com.bjhy.trademark.common.utils.ChineseUtil;
import org.junit.Test;

/**
 * Create by: Jackson
 */
public class Temp {

    @Test
    public void show(){
        String s = ChineseUtil.removeMathAndChinese("a啊,大幅度12,,3d fd");
        System.out.println(s);
    }
}
