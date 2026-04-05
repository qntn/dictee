package com.dictee.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
@Profile("prod")
public class DataSourceConfig {

    @Value("${DATABASE_URL}")
    private String databaseUrl;

    @Value("${DATABASE_USERNAME:}")
    private String username;

    @Value("${DATABASE_PASSWORD:}")
    private String password;

    @Bean
    public DataSource dataSource() {
        String jdbcUrl = toJdbcUrl(databaseUrl);
        DataSourceBuilder<?> builder = DataSourceBuilder.create().url(jdbcUrl);
        if (username != null && !username.isEmpty()) {
            builder.username(username);
        }
        if (password != null && !password.isEmpty()) {
            builder.password(password);
        }
        return builder.build();
    }

    static String toJdbcUrl(String url) {
        if (url == null) {
            return null;
        }
        String jdbcUrl;
        if (url.startsWith("jdbc:")) {
            jdbcUrl = url;
        } else {
            // Convert postgres:// or postgresql:// to jdbc:postgresql://
            jdbcUrl = url.replaceFirst("^postgres(ql)?://", "jdbc:postgresql://");
        }
        // Strip embedded user:password@ from the URL authority – the PostgreSQL JDBC
        // driver does not support the userinfo component and rejects such URLs.
        // Credentials are supplied separately via DATABASE_USERNAME / DATABASE_PASSWORD.
        return jdbcUrl.replaceFirst("(jdbc:postgresql://)(.+@)", "$1");
    }
}
