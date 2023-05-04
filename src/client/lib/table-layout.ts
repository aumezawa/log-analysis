type Datum = {
  [key: string]: any
}

type Units = {
  [key: string]: string
}

export default (nodes: Array<Array<Datum>>, pkey: string, pvalue?: string, units?: Units): Array<Array<Array<string>>> => {
  if (nodes === null || nodes.length === 0 || nodes[0].length === 0 || !pkey) {
    return []
  }

  let keys: Array<string> = []
  let keyValues: Array<any> = []

  if (!pvalue) {
    keys = [pkey].concat(
      Object.keys(nodes[0][0]).filter(
        (key: string) => (key !== pkey)
      )
    )

    nodes.forEach((node: Array<Datum>) => {
      keyValues = keyValues.concat(
        node.map(
          (datum: Datum) => datum[pkey]
        ).filter(
          (value: string) => !!value
        )
      )
    })

    keyValues = Array.from(new Set(keyValues)).sort((a: any, b: any) => {
      if (typeof a === "number" && typeof b === "number") {
        return a - b
      } else {
        return String(a) < String(b) ? -1 : 1
      }
    })
  } else {
    nodes.forEach((node: Array<Datum>) => {
      keys = keys.concat(
        node.map(
          (datum: Datum) => datum[pkey]
        ).filter(
          (value: string) => !!value
        )
      )
    })
    keys = Array.from(new Set(keys))

    keyValues = [null]
  }

  return keyValues.map((keyValue: any) => {
    return keys.map((key: string) => {
      return [key].concat(
        nodes.map((node: Array<Datum>) => {
          if (!pvalue) {
            const datum = node.find(
              (datum: Datum) => (datum[pkey] === keyValue)
            )
            return datum
              ? (
                  (units && units[key])
                  ? `${ datum[key] } ${ units[key] }`
                  : (Array.isArray(datum[key]) && datum[key].length === 0)
                  ? "n/a"
                  : Array.isArray(datum[key])
                  ? `${ datum[key].join(", ") }`
                  : `${ datum[key] }`
                )
              : "n/a"
          } else {
            const datum = node.find(
              (datum: Datum) => (datum[pkey] === key)
            )
            return datum
              ? `${ datum[pvalue] }`
              : "n/a"
          }
        })
      )
    })
  })
}
