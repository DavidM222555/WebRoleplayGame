FROM node:16-alpine3.11

ENV PATH /site/node_modules/.bin:$PATH

RUN mkdir /site
ADD .  /site/
WORKDIR /site/

RUN rm -f package-lock.json
RUN npm i
RUN npm run build