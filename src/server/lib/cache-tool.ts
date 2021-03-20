import * as fs from "fs"
import * as path from "path"

export function readCache(file: string, key: string): any {
  let data: any
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"))
  } catch {
    return null
  }

  if (key in data) {
    return data[key]
  }

  return null
}

export function writeCache(file: string, key: string, value: any): void {
  let data: any
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"))
  } catch {
    data = {}
  }

  const cacheDir = path.dirname(file)
  try {
    fs.mkdirSync(cacheDir, { recursive: true })
  } catch {
    ;
  }

  data[key] = value
  try {
    fs.writeFileSync(file, JSON.stringify(data))
  } catch {
    ;
  }

  return
}
