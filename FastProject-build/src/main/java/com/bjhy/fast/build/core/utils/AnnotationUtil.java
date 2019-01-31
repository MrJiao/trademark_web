package com.bjhy.fast.build.core.utils;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.reflect.MethodSignature;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;

/**
 * Create by: Jackson
 */
public class AnnotationUtil {

    /**
     * 解析方法上的注解
     */
    public static <T extends Annotation> T parseMethod(JoinPoint joinPoint, Class<T> annotationClass){
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        Method method = methodSignature.getMethod();
        return method.getAnnotation(annotationClass);
    }

    /**
     * 解析类上的注解
     */
    public static <T extends Annotation> T parseClass(JoinPoint joinPoint, Class<T> annotationClass){
        return joinPoint.getTarget().getClass().getAnnotation(annotationClass);
    }

    /**
     * 解析方法或类上的注解
     * 若方法上有就用方法上的，方法上没有的用类上的
     */
    public static <T extends Annotation> T parseMethodAndClass(JoinPoint joinPoint, Class<T> annotationClass){
        T t = parseMethod(joinPoint, annotationClass);
        if(t!=null)return t;
        return parseClass(joinPoint,annotationClass);
    }


}
