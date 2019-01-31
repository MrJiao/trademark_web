import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Create by: Jackson
 */
public class RequestParamConvert {

    @Test
    public void convert() throws IOException {
        File file = new File("/Users/jiaoyubing/work_space/localworkspace/trademark_web/trademark-common/src/test/java/head.txt");
        List<String> strings = FileUtils.readLines(file, "utf-8");
        System.out.println("HashMap<String, String> headers = new HashMap<>();");
        for (String string : strings) {
            String[] split = string.split(": ");
            split[0] = split[0].trim();
            split[1] = split[1].trim();
            if(filter(split))
                continue;
            System.out.println(convert(split));
        }
        System.out.println("return headers;");

    }

    private boolean filter(String[] split) {
        if(StringUtils.equals(split[0],"Content-Length")||
                StringUtils.equals(split[0],"Cookie")){
            return true;
        }
        return false;
    }


    private String convert(String[] s){
        StringBuilder sb = new StringBuilder();
        sb.append("headers.put(\"").append(s[0]).append("\", \"")
                .append(s[1]).append("\");");
        return sb.toString();
    }

}
