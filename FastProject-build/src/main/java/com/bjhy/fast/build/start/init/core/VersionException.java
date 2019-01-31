package com.bjhy.fast.build.start.init.core;

/**
 * Create by: Jackson
 */
public class VersionException extends RuntimeException {

    public VersionException() {
    }

    public VersionException(String message) {
        super(message);
    }

    public VersionException(String message, Throwable cause) {
        super(message, cause);
    }

    public VersionException(Throwable cause) {
        super(cause);
    }

    public VersionException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
