import com.bjhy.trademark.data.auto_word.AddressUtil;
import com.bjhy.trademark.data.auto_word.NotFoundPinYin;
import org.junit.Test;

/**
 * Create by: Jackson
 */
public class Temp {


    @Test
    public void show() throws NotFoundPinYin {
        String s = AddressUtil.getShiCounty("中国海南省低级县");
        System.out.println(s);


    }

}
