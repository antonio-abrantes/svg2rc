# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: runtime (Nitro node-server) ----
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=80
ENV PORT=80
ENV HOST=0.0.0.0

COPY --from=build /app/.output ./.output

EXPOSE 80
CMD ["node", ".output/server/index.mjs"]
