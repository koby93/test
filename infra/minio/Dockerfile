# Build the upstream security release from verified source; no deprecated binary image is required.
FROM golang:1.24.8-bookworm AS build
WORKDIR /source
RUN git clone --depth 1 --branch RELEASE.2025-10-15T17-29-55Z https://github.com/minio/minio.git . \
    && test "$(git rev-parse HEAD)" = "9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a"
RUN CGO_ENABLED=0 go build -p 2 -trimpath -ldflags="-s -w" -o /out/minio .

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /out/minio /usr/local/bin/minio
COPY --from=build /source/LICENSE /usr/share/doc/minio/LICENSE
LABEL org.opencontainers.image.source="https://github.com/minio/minio" \
      org.opencontainers.image.revision="9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a"
EXPOSE 9000 9001
ENTRYPOINT ["minio"]
