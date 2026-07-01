package com.example.thietbicongnghe.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final JdbcTemplate jdbcTemplate;

    public CartController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // =====================================================
    // GET CART
    // =====================================================
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getCart(
            @RequestParam String username
    ) {

        String sql = """
            SELECT 
                c.id,
                c.username,
                c.product_id,
                p.name,
                p.price,
                c.quantity
            FROM cart c
            LEFT JOIN products p ON c.product_id = p.id
            WHERE c.username = ?
        """;

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, username);

        return ResponseEntity.ok(result);
    }

    // =====================================================
    // ADD TO CART
    // =====================================================
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(
            @RequestParam String username,
            @RequestParam Integer productId
    ) {

        // validate input
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body("username không hợp lệ");
        }

        if (productId == null) {
            return ResponseEntity.badRequest().body("productId không hợp lệ");
        }

        // check product tồn tại (tránh 500 do product không có)
        Integer productExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE id = ?",
                Integer.class,
                productId
        );

        if (productExists == null || productExists == 0) {
            return ResponseEntity.badRequest().body("Sản phẩm không tồn tại");
        }

        // check cart item
        String checkSql = """
            SELECT COUNT(*) 
            FROM cart 
            WHERE username = ? AND product_id = ?
        """;

        Integer count = jdbcTemplate.queryForObject(
                checkSql,
                Integer.class,
                username,
                productId
        );

        if (count == null) count = 0;

        if (count > 0) {
            jdbcTemplate.update("""
                UPDATE cart 
                SET quantity = quantity + 1 
                WHERE username = ? AND product_id = ?
            """, username, productId);

        } else {
            jdbcTemplate.update("""
                INSERT INTO cart (username, product_id, quantity) 
                VALUES (?, ?, 1)
            """, username, productId);
        }

        return ResponseEntity.ok("Thêm vào giỏ hàng thành công");
    }

    // =====================================================
    // UPDATE QUANTITY
    // =====================================================
    @PostMapping("/update")
    public ResponseEntity<String> updateQuantity(
            @RequestParam int cartId,
            @RequestParam int quantity
    ) {

        if (quantity <= 0) {
            jdbcTemplate.update("DELETE FROM cart WHERE id = ?", cartId);
            return ResponseEntity.ok("Đã xóa sản phẩm khỏi giỏ hàng");
        }

        int updated = jdbcTemplate.update(
                "UPDATE cart SET quantity = ? WHERE id = ?",
                quantity,
                cartId
        );

        if (updated == 0) {
            return ResponseEntity.badRequest().body("Cart item không tồn tại");
        }

        return ResponseEntity.ok("Cập nhật thành công");
    }

    // =====================================================
    // DELETE ITEM
    // =====================================================
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFromCart(
            @RequestParam int cartId
    ) {

        int deleted = jdbcTemplate.update(
                "DELETE FROM cart WHERE id = ?",
                cartId
        );

        if (deleted == 0) {
            return ResponseEntity.badRequest().body("Không tìm thấy sản phẩm để xóa");
        }

        return ResponseEntity.ok("Xóa thành công");
    }
}