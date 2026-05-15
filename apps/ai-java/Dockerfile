# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY apps/ai-java/pom.xml ./pom.xml
RUN mvn -B -q dependency:go-offline
COPY apps/ai-java/src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre-jammy AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /workspace/target/ai-service.jar /app/app.jar
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --retries=8 \
    CMD curl -fsS http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
