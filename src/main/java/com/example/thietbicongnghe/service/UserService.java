package com.example.thietbicongnghe.service;


import com.example.thietbicongnghe.entity.User;

public interface UserService {

    String register(User user);

    String login(String username, String password);

    String changePassword(String username, String oldPassword, String newPassword);

}
