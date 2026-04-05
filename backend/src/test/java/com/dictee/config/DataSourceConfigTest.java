package com.dictee.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class DataSourceConfigTest {

    @Test
    void toJdbcUrl_returnsNull_whenNullInput() {
        assertNull(DataSourceConfig.toJdbcUrl(null));
    }

    @Test
    void toJdbcUrl_convertsPostgresScheme() {
        String result = DataSourceConfig.toJdbcUrl("postgres://user:pass@host:5432/db");
        assertEquals("jdbc:postgresql://host:5432/db", result);
    }

    @Test
    void toJdbcUrl_convertsPostgresqlScheme() {
        String result = DataSourceConfig.toJdbcUrl("postgresql://user:pass@host:5432/db");
        assertEquals("jdbc:postgresql://host:5432/db", result);
    }

    @Test
    void toJdbcUrl_convertsPostgresSchemeWithoutCredentials() {
        String result = DataSourceConfig.toJdbcUrl("postgres://host:5432/db");
        assertEquals("jdbc:postgresql://host:5432/db", result);
    }

    @Test
    void toJdbcUrl_leavesJdbcUrlWithoutCredentialsUnchanged() {
        String url = "jdbc:postgresql://host:5432/db";
        assertEquals(url, DataSourceConfig.toJdbcUrl(url));
    }

    @Test
    void toJdbcUrl_stripsCredentialsFromJdbcUrl() {
        // Render's jdbcConnectionString embeds user:password in the URL authority
        String result = DataSourceConfig.toJdbcUrl("jdbc:postgresql://dictee_db_user:secret@dpg-abc123/dictee_db");
        assertEquals("jdbc:postgresql://dpg-abc123/dictee_db", result);
    }

    @Test
    void toJdbcUrl_stripsCredentialsFromJdbcUrlWithAtInPassword() {
        // Passwords may contain '@' – ensure the last '@' is used as the delimiter
        String result = DataSourceConfig.toJdbcUrl("jdbc:postgresql://user:p%40ss@host:5432/db");
        assertEquals("jdbc:postgresql://host:5432/db", result);
    }
}

