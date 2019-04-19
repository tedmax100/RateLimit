# build stage
FROM node:10.15.3-alpine as BASE
WORKDIR /app
COPY package.json .
RUN npm install 
COPY ./dist .

# final stage
FROM BASE as RELEASE
EXPOSE 9988
CMD ["node", "index.js"]
