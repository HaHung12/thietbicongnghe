# Java 17
FROM eclipse-temurin:17-jdk

# Thư mục làm việc
WORKDIR /app

# Copy file jar
COPY target/*.jar app.jar

# Mở cổng
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java","-jar","app.jar"]