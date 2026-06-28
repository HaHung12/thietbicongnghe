package com.example.thietbicongnghe.service.impl;

import com.example.thietbicongnghe.entity.User;
import com.example.thietbicongnghe.repository.UserRepository;
import com.example.thietbicongnghe.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public String register(User user) {
        if (user == null
                || isBlank(user.getUsername())
                || isBlank(user.getPassword())
                || isBlank(user.getFullName())
                || isBlank(user.getEmail())) {
            return "Không được để trống các trường";
        }

        user.setUsername(user.getUsername().trim());
        user.setPassword(user.getPassword().trim());
        user.setFullName(user.getFullName().trim());
        user.setEmail(user.getEmail().trim());

        if (userRepository.existsByUsername(user.getUsername())) {
            return "Tên đăng nhập đã tồn tại";
        }

        userRepository.save(user);
        return "Đăng ký thành công";
    }

    @Override
    public String login(String username, String password) {
        if (isBlank(username) || isBlank(password)) {
            return "Vui lòng nhập tên đăng nhập và mật khẩu";
        }

        username = username.trim();
        password = password.trim();

        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return "Không tồn tại tài khoản";
        }

        if (!user.getPassword().equals(password)) {
            return "Sai mật khẩu";
        }

        return "Đăng nhập thành công";
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
