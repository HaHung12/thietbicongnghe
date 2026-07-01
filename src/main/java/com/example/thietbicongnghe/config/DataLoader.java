package com.example.thietbicongnghe.config;

import com.example.thietbicongnghe.entity.Product;
import com.example.thietbicongnghe.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataLoader(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) {
            return;
        }

        Product p1 = new Product();
        p1.setName("HP 15 fc0023AU R5 7520U");
        p1.setBrand("HP");
        p1.setCategory("Laptop");
        p1.setImageUrl("https://example.com/images/hp15.jpg");
        p1.setPrice(new BigDecimal("21990000"));
        p1.setDescription("Laptop HP 15, Ryzen 5 7520U, RAM 16GB, SSD 512GB.");
        p1.setRating(4.9);
        p1.setSold(4400);
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setName("MacBook Neo 13 inch A18 Pro 8GB/256GB");
        p2.setBrand("Apple");
        p2.setCategory("Laptop");
        p2.setImageUrl("https://example.com/images/macbook-neo.jpg");
        p2.setPrice(new BigDecimal("18990000"));
        p2.setDescription("MacBook Neo 13 inch A18 Pro - 8GB/256GB, thiết kế siêu mỏng.");
        p2.setRating(4.9);
        p2.setSold(2300);
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setName("Acer Aspire Go 14 AG14-72P-54DF Core 5");
        p3.setBrand("Acer");
        p3.setCategory("Laptop");
        p3.setImageUrl("https://example.com/images/acer-go.jpg");
        p3.setPrice(new BigDecimal("19990000"));
        p3.setDescription("Acer Aspire Go 14, Core i5, thiết kế nhẹ 1.4kg.");
        p3.setRating(5.0);
        p3.setSold(78);
        productRepository.save(p3);

        Product p4 = new Product();
        p4.setName("Phụ kiện Gaming Mouse Pro");
        p4.setBrand("Logitech");
        p4.setCategory("Phụ kiện máy tính");
        p4.setImageUrl("https://example.com/images/mouse-pro.jpg");
        p4.setPrice(new BigDecimal("990000"));
        p4.setDescription("Chuột chơi game có dây, thiết kế ergonomic.");
        p4.setRating(4.7);
        p4.setSold(420);
        productRepository.save(p4);

        Product p5 = new Product();
        p5.setName("Màn hình 24 inch Full HD");
        p5.setBrand("Samsung");
        p5.setCategory("Màn hình máy tính");
        p5.setImageUrl("https://example.com/images/monitor.jpg");
        p5.setPrice(new BigDecimal("5490000"));
        p5.setDescription("Màn hình 24 inch Full HD, viền mỏng.");
        p5.setRating(4.6);
        p5.setSold(1560);
        productRepository.save(p5);
    }
}
