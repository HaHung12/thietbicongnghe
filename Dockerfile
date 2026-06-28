FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /app

# copy toàn bộ code
COPY . .

EXPOSE 8080

# chạy trực tiếp Spring Boot (DEV MODE)
CMD ["mvn", "spring-boot:run"]