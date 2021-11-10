FROM node:17.1.0-alpine3.13

LABEL maintainer "Jan Sauer <jan@jansauer.de> (https://jansauer.de/)"

ENV NODE_ENV=production PORT=3000
CMD ["node", "server.js"]
EXPOSE 3000

WORKDIR /usr/src/app
ADD package*.json src/*.js ./
RUN npm ci --only=production
