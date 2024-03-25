FROM node:16.13-alpine as builder

RUN apk add --update g++ make
RUN apk add --update git
RUN apk add --update openssl
RUN apk add --update python3


RUN mkdir -p /app

WORKDIR /app
RUN git clone -b develop https://github.com/aumezawa/log-analysis.git

WORKDIR /app/log-analysis
RUN npm install

RUN mkdir -p ./local/cert

WORKDIR /app/log-analysis/local/cert
RUN openssl genrsa 2048 > private-key.pem
RUN openssl rsa -in private-key.pem -pubout -out public-key.pem
RUN openssl req -new -subj "/C=JP/ST=''/L=''/O=''/OU=''/CN=''/emailAddress=''" -key private-key.pem > server-csr.pem
RUN openssl x509 -req -in server-csr.pem -signkey private-key.pem -out server-cert.pem -days 3650

WORKDIR /app/log-analysis
RUN npm run build
RUN npm run init:user -- --force

##

FROM node:16.13-alpine

RUN apk add --update g++ make
RUN apk add --update git
RUN apk add --update python3


RUN mkdir -p /app

WORKDIR /app
RUN git clone -b develop https://github.com/aumezawa/log-analysis.git

WORKDIR /app/log-analysis
RUN npm install --production

COPY --from=builder /app/log-analysis/dist /app/log-analysis/dist
COPY --from=builder /app/log-analysis/public /app/log-analysis/public
COPY --from=builder /app/log-analysis/local /app/log-analysis/local

RUN mkdir -p /mnt/storage
VOLUME /mnt/storage

RUN ln -s /usr/bin/python3 /usr/bin/python
ENTRYPOINT mkdir -p /mnt/storage/data && npm start --storage_path=/mnt/storage

EXPOSE 3000
EXPOSE 3443
