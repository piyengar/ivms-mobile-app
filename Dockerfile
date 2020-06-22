FROM node:12.18-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
RUN npm install -g @ionic/cli
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent
COPY . .
RUN ionic build
EXPOSE 8100
CMD ionic serve --no-open --host=0.0.0.0