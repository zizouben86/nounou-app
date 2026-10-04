FROM node:20-alpine

# ⚠️ INSTALLER OPENSSL (indispensable pour Prisma sur Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --production=false

# Générer Prisma Client
RUN npx prisma generate

# Copier le code source
COPY . .

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]