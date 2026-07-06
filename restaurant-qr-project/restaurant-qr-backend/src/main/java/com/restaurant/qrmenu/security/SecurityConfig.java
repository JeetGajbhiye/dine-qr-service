package com.restaurant.qrmenu.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(c -> c.disable())
            .cors(c -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/menu", "/api/menu/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/*").permitAll()
                // Admin-only
                .requestMatchers(HttpMethod.POST, "/api/menu").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/menu/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/menu/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")
                .requestMatchers("/api/tables/**").hasRole("ADMIN")
                .anyRequest().permitAll())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
