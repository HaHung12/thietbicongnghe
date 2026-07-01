package com.example.thietbicongnghe.controller;

import com.example.thietbicongnghe.entity.CartItem;
import com.example.thietbicongnghe.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /api/cart?username=...  -> [{ id, product:{...}, quantity }]
    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@RequestParam String username) {
        return ResponseEntity.ok(cartService.getCart(username));
    }

    // POST /api/cart/add?username=...&productId=...
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestParam String username,
                                            @RequestParam Long productId) {
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body("username không hợp lệ");
        }
        if (productId == null) {
            return ResponseEntity.badRequest().body("productId không hợp lệ");
        }
        try {
            cartService.addToCart(username, productId);
            return ResponseEntity.ok("Thêm vào giỏ hàng thành công");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /api/cart/update?cartId=...&quantity=...
    @PostMapping("/update")
    public ResponseEntity<String> updateQuantity(@RequestParam Long cartId,
                                                 @RequestParam int quantity) {
        try {
            cartService.updateQuantity(cartId, quantity);
            return ResponseEntity.ok(
                    quantity <= 0 ? "Đã xóa sản phẩm khỏi giỏ hàng" : "Cập nhật thành công");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/cart/delete?cartId=...
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFromCart(@RequestParam Long cartId) {
        try {
            cartService.removeItem(cartId);
            return ResponseEntity.ok("Xóa thành công");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}