FROM node:20-alpine

WORKDIR /app

# Dépendances
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Prisma Client
RUN npx prisma generate

# Code source
COPY . .

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]