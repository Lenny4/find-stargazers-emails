FROM node:20-alpine as app_node

COPY . /srv/app

WORKDIR /srv/app

RUN npm install

COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]
CMD ["npm", "start"]

