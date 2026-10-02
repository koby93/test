FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci --no-audit --no-fund

FROM dependencies AS build
COPY . .
RUN npm run build

# Frontend and backend are components of the same product and coordinated release.
FROM build AS backend
EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "@nita/backend"]

FROM build AS frontend
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@nita/frontend"]
