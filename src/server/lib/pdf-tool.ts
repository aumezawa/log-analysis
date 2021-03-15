import * as path from "path"

const rootPath: string = process.cwd()

const PdfPrinter = require("pdfmake")

const fonts = {
  IPAPGothic: {
    normal:      path.join(rootPath, "lib", "font", "ipagp.ttf"),
    bold:        path.join(rootPath, "lib", "font", "ipagp.ttf"),
    italics:     path.join(rootPath, "lib", "font", "ipagp.ttf"),
    bolditalics: path.join(rootPath, "lib", "font", "ipagp.ttf")
  },
  IPAPMincho: {
    normal:      path.join(rootPath, "lib", "font", "ipamp.ttf"),
    bold:        path.join(rootPath, "lib", "font", "ipamp.ttf"),
    italics:     path.join(rootPath, "lib", "font", "ipamp.ttf"),
    bolditalics: path.join(rootPath, "lib", "font", "ipamp.ttf")
  }
}

const template = {
  defaultStyle: {
    font: "IPAPMincho",
    fontSize: 12
  },
  styles: {
    title: {
      font: "IPAPGothic",
      fontSize: 16,
      alignment: "center"
    },
    author: {
      font: "IPAPGothic",
      alignment: "right"
    }
  },
  content: ([] as any)
}

export function createDocument(title: string, author: string, body: Array<any>): Promise<Buffer> {
  return new Promise<Buffer>((resolve: (pdfDoc: Buffer) => void, reject: (err? :any) => void) => {
    return setImmediate(() => {
      const pdfDef = JSON.parse(JSON.stringify(template))
      pdfDef.content.push({ text: title, style: "title", margin: [ 0, 2, 0, 2 ] })
      pdfDef.content.push({ text: `${ new Date().toLocaleDateString() }  ${ author }`, style: "author", margin: [ 0, 2, 0, 10 ] })
      pdfDef.content = pdfDef.content.concat(body)

      const printer = new PdfPrinter(fonts)
      const pdfDoc = printer.createPdfKitDocument(pdfDef)
      const chunks: Array<Buffer> = []
      pdfDoc.on("data", (chunk: Buffer)  => {
        chunks.push(chunk)
      })
      pdfDoc.on("end", () => {
        resolve(Buffer.concat(chunks))
      })
      pdfDoc.end()
    })
  })
}
