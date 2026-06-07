# syntax=docker/dockerfile:1

# ---------- build stage ----------
FROM node:22-alpine AS build
ENV HUSKY=0
RUN corepack enable
WORKDIR /repo

# Install with a warm, cacheable dependency layer
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/move-contract/package.json packages/move-contract/package.json
RUN pnpm install --frozen-lockfile

# Build the web app
COPY . .
RUN pnpm --filter @devote/web build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
