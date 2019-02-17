package com.bjhy.trademark.data.pic_orc.domain;

import java.util.List;

/**
 * Create by: Jackson
 */
public class Temp {

    /**
     * log_id : 1182232385436019216
     * words_result : [{"words":"2月件日","location":{"top":14,"left":76,"width":115,"height":43}},{"words":"读《原上的小才盛","location":{"top":43,"left":421,"width":337,"height":77}},{"words":"在署假里,我读了很多书让我最难的一本书京是竿康上的","location":{"top":66,"left":144,"width":918,"height":101}},{"words":"小植》。王物村:赛粒、玛丽林琳综麦玲,皮特性萧爬","location":{"top":119,"left":71,"width":971,"height":89}},{"words":"募拉的爸爸婚妈。","location":{"top":192,"left":83,"width":270,"height":53}},{"words":"到大量原上注,他,把生活搬人莲车,按示-醉上","location":{"top":249,"left":61,"width":999,"height":105}},{"words":"5衰事,池们竖酌到达挚,抡壮遇到逗绊失禾哄考持生,","location":{"top":296,"left":68,"width":961,"height":103}},{"words":"弛交搅,并利班分别耿吝叫皮博和膀。爸砍来了徒","location":{"top":347,"left":65,"width":978,"height":91}},{"words":"体林雳练逛家具做做完席于经晚上￥聂爸爸","location":{"top":397,"left":140,"width":931,"height":100}},{"words":"尤开欲林做,而就家里做缀和做家务菇拉和","location":{"top":445,"left":91,"width":921,"height":87}},{"words":"丽就恩蔽最怕锄木琳林爸爸砍完回家肩做丁家就物猎去了","location":{"top":505,"left":59,"width":989,"height":75}},{"words":"脆上做了墩大家吃息就者睡逗第天早占爸","location":{"top":549,"left":61,"width":979,"height":69}},{"words":"爸去拭斯老静先新忙主堂冰恭考柔郑然其储特先生没志盒","location":{"top":594,"left":56,"width":1017,"height":78}},{"words":"爸进救斯先生嫌气好下。印人也慢慢变爹-大","location":{"top":647,"left":53,"width":1020,"height":69}},{"words":"身变青偷茁那片草原_煮是钓,劫以玫府愿荒煮","location":{"top":689,"left":42,"width":1037,"height":79}},{"words":"赶走,求费拉家静献。三","location":{"top":750,"left":45,"width":514,"height":67}},{"words":"我觉得这推常春太然多襟呀,以我安","location":{"top":798,"left":138,"width":875,"height":68}},{"words":"书。","location":{"top":860,"left":42,"width":71,"height":49}}]
     * words_result_num : 18
     */

    private long log_id;
    private int words_result_num;
    private List<WordsResultBean> words_result;

    public long getLog_id() {
        return log_id;
    }

    public void setLog_id(long log_id) {
        this.log_id = log_id;
    }

    public int getWords_result_num() {
        return words_result_num;
    }

    public void setWords_result_num(int words_result_num) {
        this.words_result_num = words_result_num;
    }

    public List<WordsResultBean> getWords_result() {
        return words_result;
    }

    public void setWords_result(List<WordsResultBean> words_result) {
        this.words_result = words_result;
    }

    public static class WordsResultBean {
        /**
         * words : 2月件日
         * location : {"top":14,"left":76,"width":115,"height":43}
         */

        private String words;
        private LocationBean location;

        public String getWords() {
            return words;
        }

        public void setWords(String words) {
            this.words = words;
        }

        public LocationBean getLocation() {
            return location;
        }

        public void setLocation(LocationBean location) {
            this.location = location;
        }

        public static class LocationBean {
            /**
             * top : 14
             * left : 76
             * width : 115
             * height : 43
             */

            private int top;
            private int left;
            private int width;
            private int height;

            public int getTop() {
                return top;
            }

            public void setTop(int top) {
                this.top = top;
            }

            public int getLeft() {
                return left;
            }

            public void setLeft(int left) {
                this.left = left;
            }

            public int getWidth() {
                return width;
            }

            public void setWidth(int width) {
                this.width = width;
            }

            public int getHeight() {
                return height;
            }

            public void setHeight(int height) {
                this.height = height;
            }
        }
    }
}
