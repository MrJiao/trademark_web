package com.bjhy.fast.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.util.Assert;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


/**
 * Create by: Jackson
 */
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .headers().frameOptions().disable()
                .and()
                .formLogin()//表单认证
                .loginPage("/login/page")//定义登录页
                .loginProcessingUrl("/login")//指定登录url
                .failureForwardUrl("/loginFailure")//失败跳转url
                //.successForwardUrl("/eventSource/index")//登录成功跳转url
                .successHandler(new SuccessGetForward("/"))
                .and()
                .authorizeRequests()//下面都是授权的配置
                .antMatchers(findAllFilterURL())//访问这个路径
                .permitAll()//不需要验证
                .anyRequest()//任何请求
                .authenticated()//都需要认证
                .and()
                .csrf().disable();



        /* // 所有请求均可访问
        http.authorizeRequests()
                .antMatchers("/", "/login", "/login-error", "/css/**", "/index")
                .permitAll();

        // 其余所有请求均需要权限
        http.authorizeRequests()
                .anyRequest()
                .authenticated();

*/

    }

    public static class SuccessGetForward implements AuthenticationSuccessHandler{
        private final String forwardUrl;

        public SuccessGetForward(String forwardUrl) {
            Assert.isTrue(UrlUtils.isValidRedirectUrl(forwardUrl), "'"
                    + forwardUrl + "' is not a valid forward URL");
            this.forwardUrl = forwardUrl;
        }

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
            response.sendRedirect(request.getContextPath()+forwardUrl);
            //request.getRequestDispatcher(forwardUrl).forward(request, response);
        }
    }





    private String[] findAllFilterURL() throws IOException {
        String[] filterUrls =
                {"/init","/login","/register","/register/page","/login/page","/js-module/**", "/platform/css/**", "/platform/js/**","/**/400", "/**/403", "/**/404", "/**/500", "/**/images/**", "/**/js/**", "/**/illegalLicense"
                        ,"/**/css/**", "/**/invalidSession", "/**/login", "/**/logout", "/**/entry", "/redirectLogin"
                        , "/**/sso/**","/**/ssoLogout/**","/**/spring_logout/**", "/**/net_detect", "/**/net_check", "/**/static/**", "/**/jquery/**"};


        String[] swagger = {"/v2/api-docs"
                ,"/swagger-resources/configuration/ui"
                ,"/swagger-resources"
                ,"/swagger-resources/configuration/security"
                ,"/swagger-ui.html"};

        String[] test = {"/temp/in/**","/temp/out","/temp/in2/**","/forward/provider/**","/forward/publish/**"};

        List<String> filterUrlList = Arrays.asList(filterUrls);
        List<String> swaggerList = Arrays.asList(swagger);
        List<String> testList = Arrays.asList(test);
        ArrayList<String> arr = new ArrayList<>();
        arr.addAll(filterUrlList);
        arr.addAll(swaggerList);
        arr.addAll(testList);
        String[] s = new String[filterUrlList.size()+swaggerList.size()];
        s= arr.toArray(s);
        return s;
    }



/*    @Override
    protected AuthenticationManager authenticationManager() throws Exception {
        return super.authenticationManager();
    }*/

    /*  @Autowired
        public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
            auth.inMemoryAuthentication()
                    .withUser("user")
                    .password("password")
                    .roles("USER");

        }

        @Bean
        UserDetailsService getUserDetailsService(){
            return new SecurityUserInfoService();
        }

        @Override
        protected UserDetailsService userDetailsService() {
            return getUserDetailsService();
        }


    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        super.configure(auth);
    }

    @Override
    public void setObjectPostProcessor(ObjectPostProcessor<Object> objectPostProcessor) {
        super.setObjectPostProcessor(objectPostProcessor);
    }
 */

}
