FROM node:8

WORKDIR /srv
ADD ./ /srv/

EXPOSE 3000

RUN npm install

CMD npm start
