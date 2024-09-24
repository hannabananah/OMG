# Use Gradle image for building, specify JDK 17 as the target
FROM gradle:8.0-jdk17 AS build

WORKDIR /app

# Copy build.gradle and settings.gradle for dependency resolution
COPY build.gradle settings.gradle ./

# Copy the rest of the application code
COPY . /app

# Build the project and skip the tests (-x test)
RUN gradle clean build --no-daemon -x test

# Use JRE for runtime environment to keep the image size smaller
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy the built JAR from the build stage to the runtime stage
COPY --from=build /app/build/libs/*.jar /app/omg-backend.jar

# Expose the necessary port for the backend (8080)
EXPOSE 8080

# Run the Spring Boot application using the built JAR with the 'prod' profile active
ENTRYPOINT [ "java" ]
CMD [ "-jar", "omg-backend.jar", "--spring.profiles.active=prod"]
