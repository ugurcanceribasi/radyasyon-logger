FROM node:14-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3002
CMD ["npm", "start"]

# docker build -t radyasyon-logger-server . 
# docker run --name radyasyon-logger-server  -d -p 1000:3002 radyasyon-logger-server:latest
