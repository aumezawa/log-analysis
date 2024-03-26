################################################################################
# Global Variables
ARG REPOSITORY="https://github.com/aumezawa/log-analysis.git"
ARG BRANCH="vmlog"

ARG APPNAME="log-analysis"
ARG APPDIR="/app"
ARG STRDIR="/mnt/storage"


################################################################################
## Builder-1
FROM node:16.13-alpine as builder-1
ARG REPOSITORY
ARG BRANCH
ARG APPNAME
ARG APPDIR
ARG STRDIR

### Required pakcages
RUN apk add --update g++ make
RUN apk add --update git
RUN apk add --update openssl
RUN apk add --update python3

### Install pakcages for app
RUN mkdir -p ${APPDIR}

WORKDIR ${APPDIR}
RUN git clone -b ${BRANCH} ${REPOSITORY}

WORKDIR ${APPDIR}/${APPNAME}
RUN npm install

### Create certification files
RUN mkdir -p ./local/cert

WORKDIR ${APPDIR}/${APPNAME}/local/cert
RUN openssl genrsa 2048 > private-key.pem
RUN openssl rsa -in private-key.pem -pubout -out public-key.pem
RUN openssl req -new -subj "/C=JP/ST=''/L=''/O=''/OU=''/CN=''/emailAddress=''" -key private-key.pem > server-csr.pem
RUN openssl x509 -req -in server-csr.pem -signkey private-key.pem -out server-cert.pem -days 3650

### Build app
WORKDIR ${APPDIR}/${APPNAME}
RUN npm run build
RUN npm run init:user -- --force


################################################################################
## Builder-2
FROM node:16.13-alpine as builder-2
ARG REPOSITORY
ARG BRANCH
ARG APPNAME
ARG APPDIR
ARG STRDIR

### Required packages
RUN apk add --update g++ make
RUN apk add --update git
RUN apk add --update python3

### Install pakcages for app
RUN mkdir -p ${APPDIR}

WORKDIR ${APPDIR}
RUN git clone -b ${BRANCH} ${REPOSITORY}

WORKDIR ${APPDIR}/${APPNAME}
RUN npm install --production


################################################################################
## Main
FROM node:16.13-alpine
ARG APPNAME
ARG APPDIR
ARG STRDIR
ENV STRDIR=${STRDIR}

### Required packages
RUN apk add --update python3

### Copy pakcages for app
RUN mkdir -p ${APPDIR}/${APPNAME}

WORKDIR ${APPDIR}/${APPNAME}
COPY --from=builder-1 ${APPDIR}/${APPNAME}/bin ${APPDIR}/${APPNAME}/bin
COPY --from=builder-1 ${APPDIR}/${APPNAME}/dist ${APPDIR}/${APPNAME}/dist
COPY --from=builder-1 ${APPDIR}/${APPNAME}/local ${APPDIR}/${APPNAME}/local
COPY --from=builder-1 ${APPDIR}/${APPNAME}/public ${APPDIR}/${APPNAME}/public
COPY --from=builder-1 ${APPDIR}/${APPNAME}/src/server/exts ${APPDIR}/${APPNAME}/src/server/exts
COPY --from=builder-1 ${APPDIR}/${APPNAME}/package.json ${APPDIR}/${APPNAME}/package.json
COPY --from=builder-1 ${APPDIR}/${APPNAME}/LICENSE ${APPDIR}/${APPNAME}/LICENSE
COPY --from=builder-1 ${APPDIR}/${APPNAME}/README.md ${APPDIR}/${APPNAME}/README.md
COPY --from=builder-1 ${APPDIR}/${APPNAME}/WHATSNEW.md ${APPDIR}/${APPNAME}/WHATSNEW.md

COPY --from=builder-2 ${APPDIR}/${APPNAME}/node_modules ${APPDIR}/${APPNAME}/node_modules

### Setup external storage path
RUN mkdir -p ${STRDIR}
VOLUME ${STRDIR}

### Run service
RUN ln -s /usr/bin/python3 /usr/bin/python
ENTRYPOINT mkdir -p ${STRDIR}/data && npm start --storage_path=${STRDIR}

### Listen ports
EXPOSE 3000
EXPOSE 3443
