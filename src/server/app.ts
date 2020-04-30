import * as express from "express"
import * as bodyParser from "body-parser"
import * as path from "path"
import * as helmet from "helmet"

import indexRouter from "./routes/index"
import apiV1Router from "./routes/api-v1"

const app: express.Express = express()
const root: string = process.cwd()

app.set("tokenKey", process.env.npm_package_name)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())

app.use("/", indexRouter)
app.use("/", express.static(path.join(root, "public")))

app.use("/api/v1", apiV1Router)

export = app
