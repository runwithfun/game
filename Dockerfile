FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/docs /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -f /etc/nginx/conf.d/default.conf.default

RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]