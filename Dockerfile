FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package and lock is copied
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]

