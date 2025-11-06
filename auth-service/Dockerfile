# ===== Stage 1: Build the Spring Boot application using Maven =====
# We use a specific Maven image that already includes Java 21 (temurin)
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only files needed to resolve deps first (better caching)
COPY pom.xml .
#
RUN mvn -q -B -DskipTests dependency:go-offline

# Now copy sources and build
COPY src ./src
#
RUN mvn -q -B -DskipTests clean package

# ===== Stage 2: Lightweight runtime =====
# We use a tiny Java 21 runtime (JRE)
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port for this specific service
EXPOSE 9001

# Run the application
ENTRYPOINT ["java","-jar", "/app/app.jar"]