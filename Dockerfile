FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package and lock is copied
COPY package*.json ./

# Bundle app source
COPY . .

RUN apt install chromium-browser chromium-codecs-ffmpeg -y
RUN apt-get --fix-broken install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

RUN npm install && npm run prod-build

# Expose 3000 and then map at runtime to a different port
# docker run -p 8080:3000 -d lnicdockerhub/app:latest-travis
EXPOSE 3000

CMD [ "node", "dist/app" ]