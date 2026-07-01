package com.example.thietbicongnghe.repository;

import com.example.thietbicongnghe.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

// Cần để update/delete 1 item theo cartId (chính là CartItem.id) mà frontend gửi lên.
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}