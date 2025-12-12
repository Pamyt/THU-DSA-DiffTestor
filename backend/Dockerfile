# Build stage
FROM node:18-slim AS builder

RUN apt-get update && apt-get install -y g++ build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-slim

RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# App files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/standard-programs ./standard-programs

# Runtime dirs
RUN mkdir -p /app/uploads /app/temp /app/results

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]