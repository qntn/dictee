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
        assertEquals("jdbc:postgresql://user:pass@host:5432/db", result);
    }

    @Test
    void toJdbcUrl_convertsPostgresqlScheme() {
        String result = DataSourceConfig.toJdbcUrl("postgresql://user:pass@host:5432/db");
        assertEquals("jdbc:postgresql://user:pass@host:5432/db", result);
    }

    @Test
    void toJdbcUrl_leavesJdbcUrlUnchanged() {
        String url = "jdbc:postgresql://user:pass@host:5432/db";
        assertEquals(url, DataSourceConfig.toJdbcUrl(url));
    }
}
