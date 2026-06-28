package com.example.thietbicongnghe.service.impl;


import com.example.thietbicongnghe.entity.User;
import org.springframework.stereotype.Service;
import com.example.thietbicongnghe.repository.UserRepository;
import com.example.thietbicongnghe.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public String register(User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            return "Tên đăng nhập đã tồn tại";
        }

        userRepository.save(user);

        return "Đăng ký thành công";
    }

    @Override
    public String login(String username, String password) {

        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return "Không tồn tại tài khoản";
        }

        if (!user.getPassword().equals(password)) {
            return "Sai mật khẩu";
        }

        return "Đăng nhập thành công";
    }
}