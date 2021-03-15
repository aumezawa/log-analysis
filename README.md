# log-analysis

## How to use


### step 1

Install required packages.

```
# npm install
# npm install --global gulp
# npm run post-install
```


### step 2

Make `/local/cert` directory in the project root, and store the three keys below in `/local/cert`.

- public key (named as `public-key.pem`)
- private key (named as `private-key.pem`)
- certificate (named as `server-cert.pem`)

```
# mkdir ./local
# mkdir ./local/cert
# cd ./local/cert
# openssl genrsa 2048 > private-key.pem
# openssl rsa -in private-key.pem -pubout -out public-key.pem
# openssl req -new -key private-key.pem > server-csr.pem
# openssl x509 -req -in server-csr.pem -signkey private-key.pem -out server-cert.pem -days 3650
# cd ../..
```


### step 3

Initialize a user list, and set root password.

```
# npm run init:user
```


### step 4

Build server and client codes.

```
# npm run build
```


### step 5

Start server.

```
# npm start
```


### step 6

Access with your browser or issue HTTP requests.


---
## API


### Get Public Key

- request
  - method: `GET`
  - path: `/api/v1/public-key`
- response
  - data: `{ msg: <string>, key: <string> }`


### Login

- request
  - method: `POST`
  - header: `{ Content-Type: application/x-www-form-urlencoded }`
  - path: `/api/v1/login`
  - body: `{ username: <string>, password: <string>, encrypted?: <boolean> }`
- response
  - data: `{ msg: <string>, token: <string> }`

**Note: The password must be encrypted by the public key, and be encoded by Base64.**


### Get Token Status

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/token`
- response
  - data: `{ msg: <string>, iss: <string>, sub: <string>, iat: <string>, exp: <string>, IssueAt: <string>, ExpirationTime: <string> }`


### Get Change History

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/whatsnew`
- response
  - data: `<string>`


### Get Domain Validated

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain`
- response
  - data: `{ msg: <string> }`


### Get Project List

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects`
- response
  - data: `{ msg: <string>, projects: [{ name: <string>, description: <string> }] }`


### Create a Project

- request
  - method: `POST`
  - header: `{ X-Access-Token: <string>, Content-Type: application/x-www-form-urlencoded }`
  - path: `/api/v1/log/:domain/projects`
  - body: `{ name: <string>, description?: <string> }`
- response
  - header: `{ Location: <URL> }`
  - data: `{ msg: <string> }`


### Get a Project Status / Description

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName`
- response
  - data: `{ msg: <string>, status:<string>, description: <string> }`


### Update a Project Status / Description

- request
  - method: `PUT`
  - header: `{ X-Access-Token: <string>, Content-Type: application/x-www-form-urlencoded }`
  - path: `/api/v1/log/:domain/projects/:projectName`
  - body: `{ status?: "open" | "close", description?: <string> }`
- response
  - data: `{ msg: <string> }`


### Delete a Project

- request
  - method: `DELETE`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName`
- response
  - data: `{ msg: <string> }`


### Get Bundle List

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles`
- response
  - data: `{ msg: <string>, projects: [{ id: <number>, name: <string>, description: <string>, available: <boolean> }] }`


### Upload a Bundle

- request
  - method: `POST`
  - header: `{ X-Access-Token: <string>, Content-Type: multipart/form-data }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles`
  - body: `{ bundle: <object>. name: <string>, description?: <string> }`
- response
  - header: `{ Location: <URL> }`
  - data: `{ msg: <string> }`


### Get a Bundle Name and Description

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId`
- response
  - data: `{ msg: <string>, name:<string>, description: <string> }`


### Update a Bundle Description

- request
  - method: `PUT`
  - header: `{ X-Access-Token: <string>, Content-Type: application/x-www-form-urlencoded }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId`
  - body: `{ description: <string> }`
- response
  - data: `{ msg: <string> }`


### Delete a Bundle

- request
  - method: `DELETE`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId`
- response
  - data: `{ msg: <string> }`


### Get File List

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId/files`
- response
  - data: `{ msg: <string>, files: <Node> }`

**Note: definition**

```
<Node> := <File> | <Directory>
<File> := { name: <string>, file: true }
<Directory> := { name: <string>, file: false, children: [<Node>] }
```


### Get a File

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId/files/:filepath`
- response
  - data: `{ msg: <string>, content: <string>, size: <number>, modifiedAt: <string> }`


### Get a File as plain

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId/files/:filepath`
  - query: `{ mode: plain }`
- response
  - data: `{ msg: <string>, content: <string>, size: <number>, modifiedAt: <string> }`


### Get a File as json format

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId/files/:filepath`
  - query: `{ mode: json }`
- response
  - data: `{ msg: <string>, content: <JSON Table>, size: <number>, modifiedAt: <string> }`

**Note: definition**

```
<Table Format> := { title: <string>, labels: [{ "name": <string>, type: <string> }], hasHeader: <boolean>, hasIndex: <boolean>, contentKey: <string> }
<Table Data> := [{ [label: <string>]: <string> }]
<JSON Table> := { format: <Table Format>, data: <Table Data> }
```


### Download a File

- request
  - method: `GET`
  - header: `{ X-Access-Token: <string> }`
  - path: `/api/v1/log/:domain/projects/:projectName/bundles/:bundleId/files/:filepath`
  - query: `{ mode: download }`
- response
  - data: `<object>`
