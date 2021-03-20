import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as fs from "fs"
import * as path from "path"

import logger = require("../lib/logger")

import * as PdfTool from "../lib/pdf-tool"

const rootPath: string = process.cwd()

const router: Router = express.Router()

router.route("/pdf")
.get((req: Request, res: Response, next: NextFunction) => {
  let content: Array<any>
  try {
    content = JSON.parse(fs.readFileSync(path.join(rootPath, "src", "test", "data", "pdf", "content.json"), "utf8"))
  } catch {
    content = ["This document is of a test. / このドキュメントはテスト用です。"]
  }

  return PdfTool.createDocument("Test Report / テストレポート", "User / ユーザ", content)
  .then((pdfDoc: Buffer) => {
    // OK
    return res.status(200)
      .set({
        "Content-Disposition" : `attachment; filename="sample.pdf"`,
        "Accept-Ranges"       : "bytes",
        "Cache-Control"       : "public, max-age=0",
        "Last-Modified"       : `${ new Date().toString() }`,
        "Content-Type"        : "application/pdf"
      })
      .send(pdfDoc)
  })
  .catch((err: any) => {
    // Internal Server Error
    return res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method are only supported."
  })
})


export default router
