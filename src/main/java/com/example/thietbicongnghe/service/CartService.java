package com.example.thietbicongnghe.service;

import com.example.thietbicongnghe.entity.CartItem;

import java.util.List;

public interface CartService {

    List<CartItem> getCart(String username);

    void addToCart(String username, Long productId);

    void updateQuantity(Long cartItemId, int quantity);

    void removeItem(Long cartItemId);

    void clearCart(String username);
}