\# Thiết bị công nghệ (thietbicongnghe)



Ứng dụng web quản lý người dùng cho hệ thống "Thiết bị công nghệ", xây dựng bằng Spring Boot và MySQL. Hiện đã có chức năng đăng ký và đăng nhập tài khoản.



\## Công nghệ sử dụng



\- \*\*Java 17\*\*, \*\*Spring Boot 3.5.3\*\* (build bằng Maven)

\- \*\*Spring Web\*\* – REST API

\- \*\*Spring Data JPA + Hibernate\*\* – thao tác cơ sở dữ liệu

\- \*\*MySQL 8.0\*\* – lưu trữ dữ liệu người dùng

\- \*\*Spring Security\*\* – cấu hình bảo mật

\- \*\*Swagger (springdoc-openapi)\*\* – tài liệu API

\- \*\*Docker \& Docker Compose\*\* – đóng gói và triển khai



\## Chức năng hiện có



\- Đăng ký tài khoản (username, mật khẩu, họ tên, email)

\- Đăng nhập

\- Giao diện web đơn giản (HTML/CSS/JavaScript)



\## Cách chạy bằng Docker



Yêu cầu: đã cài Docker và Docker Compose.



```bash

docker compose up -d --build

```



Sau khi các container khởi động:



\- Web (backend): http://localhost:8080

\- phpMyAdmin: http://localhost:8081

\- MySQL: cổng 3306



Dừng hệ thống:



```bash

docker compose down

```



\## API



| Method | Endpoint          | Chức năng        |

|--------|-------------------|------------------|

| POST   | `/auth/register`  | Đăng ký tài khoản |

| POST   | `/auth/login`     | Đăng nhập         |



Tài liệu API (Swagger UI): http://localhost:8080/swagger-ui.html



\## Cấu trúc thư mục



```

src/main/java/com/example/thietbicongnghe

├── controller   # REST controller (AuthController)

├── service      # Xử lý nghiệp vụ

├── repository   # Truy vấn dữ liệu (JPA)

├── entity       # Entity (User)

└── config       # Cấu hình bảo mật (SecurityConfig)

```

