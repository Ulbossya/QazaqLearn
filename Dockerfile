FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies, Node.js 20, JDK 17, and Maven
RUN apt-get update && apt-get install -y \
    curl \
    openjdk-17-jdk \
    maven \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm corepack \
    && corepack enable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package config to cache dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install Node modules
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Node apps
RUN pnpm run build

# Build Java app
RUN cd apps/ai-java && mvn clean package -DskipTests

# Run both the Java app (background) and the Node app (foreground)
CMD ["/bin/bash", "-c", "if [[ -n \"$DATABASE_URL\" ]]; then db_url=\"${DATABASE_URL#jdbc:}\"; db_scheme=\"${db_url%%://*}\"; db_authority_path=\"${db_url#*://}\"; db_host_path=\"${db_authority_path#*@}\"; export SPRING_DATASOURCE_URL=\"jdbc:${db_scheme}://${db_host_path}\"; if [[ \"$db_authority_path\" == *\"@\"* ]]; then db_userinfo=\"${db_authority_path%@*}\"; export SPRING_DATASOURCE_USERNAME=\"${PGUSER:-${DB_USER:-${db_userinfo%%:*}}}\"; export SPRING_DATASOURCE_PASSWORD=\"${PGPASSWORD:-${DB_PASSWORD:-${db_userinfo#*:}}}\"; fi; fi; export AI_PORT=8081; java -jar apps/ai-java/target/ai-service.jar & export AI_SERVICE_URL=http://localhost:8081; pnpm run start"]
