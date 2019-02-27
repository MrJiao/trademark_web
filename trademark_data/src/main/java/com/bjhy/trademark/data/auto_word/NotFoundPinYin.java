package com.bjhy.trademark.data.auto_word;

/**
 * Create by: Jackson
 */
public class NotFoundPinYin extends Exception {
    public NotFoundPinYin() {
    }

    public NotFoundPinYin(String message) {
        super(message);
    }

    public NotFoundPinYin(String message, Throwable cause) {
        super(message, cause);
    }

    public NotFoundPinYin(Throwable cause) {
        super(cause);
    }
}
