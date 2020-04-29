import * as express from "express"
import * as bodyParser from "body-parser"
import * as path from "path"
import * as helmet from "helmet"

import indexRouter from "./routes/index"

const app: express.Express = express()
const root: string = process.cwd()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())

app.use("/", indexRouter)
app.use("/", express.static(path.join(root, "public")))

export = app
