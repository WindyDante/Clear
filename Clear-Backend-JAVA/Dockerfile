FROM eclipse-temurin:17

WORKDIR /app

# 修正JAR文件路径
COPY ./clear-server/target/clear-server-1.0.0.jar /app/clear-server.jar

CMD ["java", "-jar", "clear-server.jar"]