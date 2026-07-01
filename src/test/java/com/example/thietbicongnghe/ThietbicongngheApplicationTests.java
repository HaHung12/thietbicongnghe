package com.example.thietbicongnghe;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/thietbicongnghe",
    "SPRING_DATASOURCE_USERNAME=root",
    "SPRING_DATASOURCE_PASSWORD="
})
class ThietbicongngheApplicationTests {

    @Test
    void contextLoads() {
    }

}
