package com.example.thietbicongnghe.service.impl;

import com.example.thietbicongnghe.entity.Cart;
import com.example.thietbicongnghe.entity.CartItem;
import com.example.thietbicongnghe.entity.Product;
import com.example.thietbicongnghe.repository.CartItemRepository;
import com.example.thietbicongnghe.repository.CartRepository;
import com.example.thietbicongnghe.repository.ProductRepository;
import com.example.thietbicongnghe.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    // Lấy giỏ của user, chưa có thì tạo mới
    private Cart getOrCreateCart(String username) {
        return cartRepository.findByUsername(username)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUsername(username);
                    return cartRepository.save(cart);
                });
    }

    @Override
    public List<CartItem> getCart(String username) {
        // Bọc new ArrayList(...) để nạp danh sách NGAY trong transaction
        // -> tránh LazyInitializationException khi controller serialize ra JSON.
        return new ArrayList<>(getOrCreateCart(username).getItems());
    }

    @Override
    public void addToCart(String username, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        Cart cart = getOrCreateCart(username);

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProduct() != null
                        && productId.equals(i.getProduct().getId()))
                .findFirst();

        if (existing.isPresent()) {
            // đã có sản phẩm -> tăng số lượng
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
        } else {
            // chưa có -> thêm item mới
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(1);
            cart.getItems().add(item);
        }

        cartRepository.save(cart); // cascade = ALL nên item mới được lưu theo
    }

    @Override
    public void updateQuantity(Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item không tồn tại"));

        if (quantity <= 0) {
            cartItemRepository.delete(item); // số lượng <= 0 thì xóa khỏi giỏ
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
    }

    @Override
    public void removeItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new IllegalArgumentException("Không tìm thấy sản phẩm để xóa");
        }
        cartItemRepository.deleteById(cartItemId);
    }

    @Override
    public void clearCart(String username) {
        Cart cart = getOrCreateCart(username);
        cart.getItems().clear(); // orphanRemoval = true -> xóa hết item con
        cartRepository.save(cart);
    }
}