package com.avfallskompassen.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/wasterooms/**")
                .addResourceLocations("file:uploads/wasterooms/");

    }

    @Override //TODO: Denna måste ändras om man ska göra den deployable.
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/images/wasterooms/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET")
                .allowCredentials(true);
    }
}