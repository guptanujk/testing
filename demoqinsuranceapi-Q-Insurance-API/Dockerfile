FROM node:20.10.0
RUN apt-get update
RUN apt-get install -y apt-utils
RUN apt-get install -y nginx
RUN apt-get install -y sudo
RUN apt-get install -y nano
RUN apt-get install -y vim
RUN apt-get install -y curl
WORKDIR /home/ubuntu/q-common-app/server
COPY . .
RUN npm config set registry "http://registry.npmjs.org/"
RUN npm install npm@10.2.4
RUN npm install
RUN npm install bcrypt
RUN npx tsc
RUN npx javascript-obfuscator ./dist --output ./dist1 [options]
RUN rm -rf dist
RUN rm -rf src
EXPOSE 3001
CMD npm start server
