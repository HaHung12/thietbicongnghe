package com.example.thietbicongnghe.service.impl;

import com.example.thietbicongnghe.entity.Cart;
import com.example.thietbicongnghe.entity.CartItem;
import com.example.thietbicongnghe.entity.Product;
import com.example.thietbicongnghe.repository.CartRepository;
import com.example.thietbicongnghe.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;

    public CartServiceImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    public Cart getCart(String sessionId) {

        return cartRepository.findBySessionId(sessionId).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setSessionId(sessionId);

            // ✔ FIX: tránh null items
            cart.setItems(new ArrayList<>());

            return cartRepository.save(cart);
        });
    }

    @Override
    public Cart addToCart(String sessionId, Product product, int quantity) {

        if (product == null) {
            throw new RuntimeException("Product cannot be null");
        }

        Cart cart = getCart(sessionId);

        // ✔ FIX: đảm bảo items luôn tồn tại
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item ->
                        item.getProduct() != null &&
                                item.getProduct().getId() != null &&
                                item.getProduct().getId().equals(product.getId())
                )
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Override
    public Cart removeFromCart(String sessionId, Long productId) {

        Cart cart = getCart(sessionId);

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        cart.getItems().removeIf(item ->
                item.getProduct() != null &&
                        item.getProduct().getId() != null &&
                        item.getProduct().getId().equals(productId)
        );

        return cartRepository.save(cart);
    }

    @Override
    public void clearCart(String sessionId) {

        Cart cart = getCart(sessionId);

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Override
    public Optional<Cart> findCart(String sessionId) {
        return cartRepository.findBySessionId(sessionId);
    }
}