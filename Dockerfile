FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package and lock is copied
COPY package*.json ./

# Bundle app source
COPY . .

RUN npm install && npm run prod-build

EXPOSE 8080

CMD [ "node", "dist/app" ]