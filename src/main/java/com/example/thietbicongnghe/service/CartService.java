package com.example.thietbicongnghe.service;

import com.example.thietbicongnghe.entity.Cart;
import com.example.thietbicongnghe.entity.Product;

import java.util.Optional;

public interface CartService {

    Cart getCart(String sessionId);

    Cart addToCart(String sessionId, Product product, int quantity);

    Cart removeFromCart(String sessionId, Long productId);

    void clearCart(String sessionId);

    Optional<Cart> findCart(String sessionId);
}
