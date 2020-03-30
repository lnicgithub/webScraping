FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package and lock is copied
COPY package*.json ./

RUN npm install
RUN npm run prod-build
# Bundle app source
COPY . .

EXPOSE 8080

ENTRYPOINT [ "node", "dist/app" ]