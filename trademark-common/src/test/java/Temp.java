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

    @Test
    public void isChinese(){
        boolean chinese = ChineseUtil.isChinese("阿萨德sdf");
        System.out.println(chinese);
    }

    @Test
    public void isMathAndChinese(){
        boolean chinese = ChineseUtil.isMathAndChinese("12阿12萨德,12");
        System.out.println(chinese);
    }
}
