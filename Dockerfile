FROM node:lts-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package and lock is copied
COPY package*.json ./

# Bundle app source
COPY . .

# RUN apk add --nocache udev ttf-freefont chromium git
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# ENV CHROMIUM_PATH /usr/bin/chromium-browser

RUN npm install && npm run prod-build

# Expose 3000 and then map at runtime to a different port
# docker run -p 8080:3000 -d lnicdockerhub/app:latest-travis
EXPOSE 3000

CMD [ "node", "dist/app" ]