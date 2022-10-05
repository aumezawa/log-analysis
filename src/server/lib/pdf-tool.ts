const PdfPrinter = require("pdfmake")

const fonts = {
  Courier: {
    normal: "Courier",
    bold: "Courier-Bold",
    italics: "Courier-Oblique",
    bolditalics: "Courier-BoldOblique"
  },
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique"
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic"
  },
  Symbol: {
    normal: "Symbol"
  },
  ZapfDingbats: {
    normal: "ZapfDingbats"
  }
}

const template = {
  defaultStyle: {
    font: "Courier",
    fontSize: 12
  },
  styles: {
    title: {
      font: "Helvetica",
      fontSize: 16,
      alignment: "center"
    },
    author: {
      font: "Times",
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
