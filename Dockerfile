# syntax=docker/dockerfile:1.7

# ---------- BUILD STAGE ----------
FROM node:20.18.1-bookworm-slim@sha256:b2c8e0eb8a6aeeae33b2711f8f516003e27ee45804e270468d937b3214f2f0cc AS build

RUN npm install -g pnpm@10

WORKDIR /app

ENV PNPM_STORE_DIR=/pnpm/store

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

COPY . .

RUN pnpm build

RUN pnpm prune --prod

# ---------- PROD STAGE ----------
# FROM node:20.18.1-bookworm-slim@sha256:b2c8e0eb8a6aeeae33b2711f8f516003e27ee45804e270468d937b3214f2f0cc AS prod

FROM node:20.18.1-alpine@sha256:24fb6aa7020d9a20b00d6da6d1714187c45ed00d1eb4adb01395843c338b9372

ENV NODE_ENV=production

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/src/main.js"]