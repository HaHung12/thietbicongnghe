package com.example.thietbicongnghe.service;

import com.example.thietbicongnghe.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ProductService {

    Page<Product> listAll(Pageable pageable);

    Optional<Product> findById(Long id);

    Page<Product> searchByName(String name, Pageable pageable);

    Page<Product> findByCategory(String category, Pageable pageable);

    Product save(Product product);

    void delete(Long id);
}
