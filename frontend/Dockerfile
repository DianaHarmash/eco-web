FROM nginx:alpine

# Копируем файлы в правильные директории
COPY src/ /usr/share/nginx/html/src/
COPY index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем правильные права
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80