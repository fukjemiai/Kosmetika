FROM node:20-alpine

WORKDIR /app

# Prisma na Alpine potřebuje OpenSSL (a často i libc6-compat)
RUN apk add --no-cache openssl libc6-compat

# Install dependencies first (cache layer)
COPY package.json ./
RUN npm install

# Prisma schema + generate
COPY prisma ./prisma
RUN npx prisma generate

# App sources + entrypoint
COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
