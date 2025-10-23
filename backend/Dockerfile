# Multi-stage Dockerfile for optimized production builds
FROM eclipse-temurin:21-jdk-alpine AS builder

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests -B

# Production stage
FROM eclipse-temurin:21-jre-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S jobportal && \
    adduser -S jobportal -u 1001 -G jobportal

# Set working directory
WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create directories and set permissions
RUN mkdir -p /app/logs /app/uploads && \
    chown -R jobportal:jobportal /app

# Switch to non-root user
USER jobportal

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+PrintGCDetails -Xloggc:/app/logs/gc.log"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]