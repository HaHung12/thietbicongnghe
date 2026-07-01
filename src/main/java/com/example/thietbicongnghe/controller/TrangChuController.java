package com.example.thietbicongnghe.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TrangChuController {

    @GetMapping("/trang-chu")
    public String viewTrangChu() {
        // Chuyển tiếp thẳng đến file html tĩnh nằm trong thư mục static
        return "forward:/index.html";
    }
}