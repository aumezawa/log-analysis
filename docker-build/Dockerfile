FROM node:16.13-alpine

RUN apk add --update bash
RUN apk add --update g++ make
RUN apk add --update git
RUN apk add --update openssl
RUN apk add --update python3

RUN alias python=python3


RUN mkdir /apps

WORKDIR /apps
RUN git clone -b develop https://github.com/aumezawa/log-analysis.git

WORKDIR /apps/log-analysis
RUN npm install
RUN mkdir -p ./local/cert

WORKDIR /apps/log-analysis/local/cert
RUN openssl genrsa 2048 > private-key.pem
RUN openssl rsa -in private-key.pem -pubout -out public-key.pem
RUN openssl req -new -subj "/C=JP/ST=''/L=''/O=''/OU=''/CN=''/emailAddress=''" -key private-key.pem > server-csr.pem
RUN openssl x509 -req -in server-csr.pem -signkey private-key.pem -out server-cert.pem -days 3650

WORKDIR /apps/log-analysis
RUN npm run init:user -- --force
RUN npm run build

RUN mkdir -p /mnt/storage
VOLUME /mnt/storage

ENTRYPOINT mkdir -p /mnt/storage/data && npm start --storage_path=/mnt/storage

EXPOSE 3000
EXPOSE 3443
