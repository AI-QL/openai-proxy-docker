FROM node:lts-alpine
RUN npm install pm2 -g

WORKDIR /app

COPY package*.json ./

RUN npm install ci

COPY . .

CMD ["pm2-runtime", "app.js"]
