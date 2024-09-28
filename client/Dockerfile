FROM node:18-slim AS deps
RUN corepack enable
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:18-slim AS builder
RUN corepack enable
WORKDIR /app

# .env.production ファイルをコピー
COPY .env.production ./

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-slim
RUN corepack enable
WORKDIR /app
COPY --from=builder /app/build ./build

RUN npm i -g serve
CMD ["serve", "-s", "build"]
