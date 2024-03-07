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

export function writeCache(file: string, key: string, value: any): boolean {
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
    return false
  }

  return true
}

export function deleteCache(file: string, key: string): boolean {
  let data: any
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"))
  } catch {
    return false
  }

  if (key in data) {
    delete data[key]
  } else {
    return true
  }

  try {
    fs.writeFileSync(file, JSON.stringify(data))
  } catch {
    return false
  }

  return true
}
