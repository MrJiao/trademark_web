package com.bjhy.trademark.data.pic_orc.domain;

import java.util.List;

/**
 * Create by: Jackson
 */
public class OrcData {

    /**
     * log_id : 4884855976325611935
     * words_result : [{"probability":{"average":0.995574,"min":0.966568,"variance":1.06E-4},"words":"申请人空中客车公司"},{"probability":{"average":0.964168,"min":0.894727,"variance":0.002412},"words":"AIR BUS S.A.S"},{"probability":{"average":0.994316,"min":0.945029,"variance":1.43E-4},"words":"地址法国,布拉尼亚克F-31700莫里斯贝隆特,环点一号"},{"probability":{"average":0.97111,"min":0.872897,"variance":0.001963},"words":"1ROND POINT MAURICE BELLONTEF-31700 BLAGNAC CEDEXFRANCE"},{"probability":{"average":0.999518,"min":0.995785,"variance":1.0E-6},"words":"代理机构北京集佳知识产权代理有限公司"},{"probability":{"average":0.994516,"min":0.962473,"variance":1.2E-4},"words":"核定使用商品/服务项目"},{"probability":{"average":0.986198,"min":0.728428,"variance":0.001917},"words":"第7类:飞机引擎;非陆地车辆用发动机和引擎;非陆地车辆涡轮机;发电机;非陆地车辆用喷"},{"probability":{"average":0.984976,"min":0.65733,"variance":0.00282},"words":"气发动机;辅助动力装置(陆地车辆用的除外);车辆发动机罩(机器部件);反推力装置(飞机引擎"},{"probability":{"average":0.991609,"min":0.919889,"variance":3.94E-4},"words":"部件);马达和引擎起动器;航空引擎;空气压缩机引擎;机器、引擎或发动机用控制装置;马"},{"probability":{"average":0.995244,"min":0.974013,"variance":7.7E-5},"words":"达和引擎用风扇"}]
     * words_result_num : 10
     * language : 3
     * direction : 0
     */

    private long log_id;
    private int words_result_num;
    private int language;
    private int direction;
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

    public int getLanguage() {
        return language;
    }

    public void setLanguage(int language) {
        this.language = language;
    }

    public int getDirection() {
        return direction;
    }

    public void setDirection(int direction) {
        this.direction = direction;
    }

    public List<WordsResultBean> getWords_result() {
        return words_result;
    }

    public void setWords_result(List<WordsResultBean> words_result) {
        this.words_result = words_result;
    }

    @Override
    public String toString() {
        return "OrcData{" +
                "log_id=" + log_id +
                ", words_result_num=" + words_result_num +
                ", language=" + language +
                ", direction=" + direction +
                ", words_result=" + words_result +
                '}';
    }

    public static class WordsResultBean {
        /**
         * probability : {"average":0.995574,"min":0.966568,"variance":1.06E-4}
         * words : 申请人空中客车公司
         */

        private ProbabilityBean probability;
        private String words;

        public ProbabilityBean getProbability() {
            return probability;
        }

        public void setProbability(ProbabilityBean probability) {
            this.probability = probability;
        }

        public String getWords() {
            return words;
        }

        public void setWords(String words) {
            this.words = words;
        }

        @Override
        public String toString() {
            return "WordsResultBean{" +
                    "probability=" + probability +
                    ", words='" + words + '\'' +
                    '}';
        }

        public static class ProbabilityBean {
            /**
             * average : 0.995574
             * min : 0.966568
             * variance : 1.06E-4
             */

            private double average;
            private double min;
            private double variance;

            public double getAverage() {
                return average;
            }

            public void setAverage(double average) {
                this.average = average;
            }

            public double getMin() {
                return min;
            }

            public void setMin(double min) {
                this.min = min;
            }

            public double getVariance() {
                return variance;
            }

            public void setVariance(double variance) {
                this.variance = variance;
            }

            @Override
            public String toString() {
                return "ProbabilityBean{" +
                        "average=" + average +
                        ", min=" + min +
                        ", variance=" + variance +
                        '}';
            }
        }
    }
}
