FROM ghcr.io/berriai/litellm:main-latest

WORKDIR /app

# Copy config
COPY config.yaml /app/config.yaml

# Expose litellm proxy port
EXPOSE 4000

# Start litellm proxy with the config
CMD ["--config", "/app/config.yaml", "--port", "4000"]
