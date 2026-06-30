package com.example.thietbicongnghe.controller;

import com.example.thietbicongnghe.entity.Cart;
import com.example.thietbicongnghe.entity.Product;
import com.example.thietbicongnghe.service.CartService;
import com.example.thietbicongnghe.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final ProductService productService;

    public CartController(CartService cartService, ProductService productService) {
        this.cartService = cartService;
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader("X-SESSION-ID") String sessionId) {
        Cart cart = cartService.getCart(sessionId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Cart> addToCart(@RequestHeader("X-SESSION-ID") String sessionId,
                                          @PathVariable Long productId,
                                          @RequestParam(defaultValue = "1") int quantity) {
        Optional<Product> product = productService.findById(productId);
        if (product.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Cart cart = cartService.addToCart(sessionId, product.get(), quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Cart> removeFromCart(@RequestHeader("X-SESSION-ID") String sessionId,
                                               @PathVariable Long productId) {
        Cart cart = cartService.removeFromCart(sessionId, productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestHeader("X-SESSION-ID") String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.noContent().build();
    }
}
