FROM node:17.5.0-alpine3.15

LABEL maintainer "Jan Sauer <jan@jansauer.de> (https://jansauer.de/)"

ENV NODE_ENV=production PORT=3000
CMD ["node", "server.js"]
EXPOSE 3000

WORKDIR /usr/src/app
ADD package*.json src/ ./
RUN npm ci --only=production
