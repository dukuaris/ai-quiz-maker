FROM ghcr.io/puppeteer/puppeteer:19.8.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    OPENAI_API_KEY=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

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]