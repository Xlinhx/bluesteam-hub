FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY server/package.json server/
RUN npm ci

COPY packages/contracts packages/contracts
COPY server server
RUN npm --workspace @bluesteam/contracts run build && npm --workspace @bluesteam/server run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY server/package.json server/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/contracts ./packages/contracts
COPY --from=builder /app/server/dist ./server/dist
COPY server/src/database/migrations ./server/src/database/migrations
COPY public ./public
COPY server/seed-data ./server/seed-data

RUN mkdir -p /data/uploads
EXPOSE 8010
CMD ["node", "server/dist/main.js"]
