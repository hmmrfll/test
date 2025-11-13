# Используем более новую версию Node.js
FROM node:alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта
COPY . .

# Сборка приложения
RUN npm run build

# ---------- Продакшен-сервер ----------
FROM nginx:alpine

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы в директорию Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
