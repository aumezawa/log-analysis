import * as express from "express"
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import * as favicon from "serve-favicon"
import * as path from "path"
import * as helmet from "helmet"
import * as log4js from "log4js"

import logger = require("./lib/logger")

import indexRouter from "./routes/index"
import apiV1Router from "./routes/api-v1"

const app: express.Express = express()
const rootPath: string = process.cwd()
const configPath: string = process.env.npm_package_config_storage_path
const storagePath: string = configPath && ((configPath.slice(0, 1) === "/" || configPath.slice(1, 3) === ":\\") ? configPath : path.join(rootPath, configPath))

app.set("domains", process.env.npm_package_config_domains)
app.set("http-port", Number(process.env.npm_package_config_http_port))
app.set("https-port", Number(process.env.npm_package_config_https_port))
app.set("num-workers", Number(process.env.npm_package_config_num_workers))
app.set("token-key", process.env.npm_package_name)
app.set("token-period", process.env.npm_package_config_token_period)

app.set("userlist-path", process.env.npm_package_config_userlist_path)
app.set("public-key-path", process.env.npm_package_config_public_key_path)
app.set("private-key-path", process.env.npm_package_config_private_key_path)
app.set("certificate-path", process.env.npm_package_config_certificate_path)
app.set("storage-path", storagePath)
app.set("date-format", process.env.npm_package_config_date_format)

app.use(log4js.connectLogger(logger, {
  level: "auto",
  format: (req: any, res: any, formatter: ((str: string) => string)) => (
    formatter(`${ req.protocol.toUpperCase() }/:http-version :method :status [${ (req.token && req.token.usr) || "unknown" } (:remote-addr)] :url - :user-agent - :response-time ms`)
  )
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(favicon(path.join(rootPath, "public", "image", "favicon.png")))
app.use(helmet())

app.use("/public", express.static(path.join(rootPath, "public")))
app.use("/api/v1", apiV1Router)
app.use("/", indexRouter)

export = app
