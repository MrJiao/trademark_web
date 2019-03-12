package com.bjhy.trademark.core.controller;

import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.File;
import java.io.IOException;

/**
 * Create by: Jackson
 */
@Controller
public class TempController {

    @Autowired
    PicOrc picOrc;

    @RequestMapping(value = "/temp/orc",method = RequestMethod.GET)
    public void testOrc() throws IOException {
        File source = new File(
                "/Users/jiaoyubing/work_space/localworkspace/trademark_web/trademark_core/src/test/genertor/a.jpg");
        OrcData normal = picOrc.normal(source.getAbsolutePath());
        TrademarkBean trademarkBean = new TrademarkBean();
        boolean convert = ConvertUtil.convert(normal, trademarkBean);
    }
}
