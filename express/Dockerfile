FROM node:11-alpine

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./

RUN npm install

# Copying source files
COPY . .

# Running the app
CMD [ "DEBUG=express:*", "npm", "start" ]
