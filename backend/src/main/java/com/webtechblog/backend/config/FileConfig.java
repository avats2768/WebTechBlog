package com.webtechblog.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        registry
                .addResourceHandler("/public/uploads/**")
                .addResourceLocations("file:public/uploads/");

        registry
                .addResourceHandler("/public/profile/**")
                .addResourceLocations("file:public/profile/");

        registry
                .addResourceHandler("/public/cover/**")
                .addResourceLocations("file:public/cover/");
    }
}