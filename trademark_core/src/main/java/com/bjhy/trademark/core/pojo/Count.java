package com.bjhy.trademark.core.pojo;

/**
 * Create by: Jackson
 */
public class Count {
    private int count;

    public Count(String value) {
        this.value = value;
    }

    String value;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public int getCount() {
        return count;
    }

    public void add() {
        count++;
    }
}
