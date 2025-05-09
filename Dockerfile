FROM node:18-alpine AS builder

WORKDIR /app

# Copia los archivos de configuración primero
COPY package*.json ./
COPY tsconfig.json ./

# Instala todas las dependencias, incluyendo las de desarrollo
RUN npm install

# Copia el resto del código
COPY . .

# Ejecuta el build
RUN npm run build

# Imagen de producción
FROM node:18-alpine

WORKDIR /app

# Copia solo los archivos necesarios de la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

# Instala solo las dependencias de producción
RUN npm install --omit=dev

# Comando para ejecutar la aplicación
CMD ["npm", "start"]