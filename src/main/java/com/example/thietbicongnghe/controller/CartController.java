package com.example.thietbicongnghe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CartController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Lấy toàn bộ sản phẩm cửa hàng
    @GetMapping("/products")
    public List<Map<String, Object>> getProducts() {
        return jdbcTemplate.queryForList("SELECT * FROM products");
    }

    // 2. Lấy giỏ hàng của một người dùng
    @GetMapping("/cart")
    public List<Map<String, Object>> getCart(@RequestParam String username) {
        String sql = "SELECT c.id, p.name, p.price, c.quantity, c.product_id FROM cart c JOIN products p ON c.product_id = p.id WHERE c.username = ?";
        return jdbcTemplate.queryForList(sql, username);
    }

    // 3. Thêm vào giỏ hàng
    @PostMapping("/cart/add")
    public String addToCart(@RequestParam String username, @RequestParam int productId) {
        // Kiểm tra xem sản phẩm đã có trong giỏ chưa
        String checkSql = "SELECT COUNT(*) FROM cart WHERE username = ? AND product_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, username, productId);

        if (count != null && count > 0) {
            jdbcTemplate.update("UPDATE cart SET quantity = quantity + 1 WHERE username = ? AND product_id = ?", username, productId);
        } else {
            jdbcTemplate.update("INSERT INTO cart (username, product_id, quantity) VALUES (?, ?, 1)", username, productId);
        }
        return "Thêm thành công!";
    }

    // 4. Sửa số lượng trong giỏ
    @PostMapping("/cart/update")
    public String updateQuantity(@RequestParam int cartId, @RequestParam int quantity) {
        if (quantity <= 0) {
            jdbcTemplate.update("DELETE FROM cart WHERE id = ?", cartId);
        } else {
            jdbcTemplate.update("UPDATE cart SET quantity = ? WHERE id = ?", quantity, cartId);
        }
        return "Cập nhật thành công!";
    }

    // 5. Xóa khỏi giỏ hàng
    @DeleteMapping("/cart/delete")
    public String deleteFromCart(@RequestParam int cartId) {
        jdbcTemplate.update("DELETE FROM cart WHERE id = ?", cartId);
        return "Xóa thành công!";
    }
}