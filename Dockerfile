# --- Stage 1: Build frontend ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Production server (backend + static frontend) ---
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Kopioidaan backendin lähdekoodi
COPY src/services ./src/services

# Kopioidaan buildattu frontend
COPY --from=build /app/dist ./dist

# Asetetaan ympäristömuuttujat
ENV NODE_ENV=production
ENV PORT=3001

# Avaa portti
EXPOSE 3001

# Käynnistä backend (joka palvelee myös frontin)
CMD ["node", "src/services/server.js"]
