import * as fs from "fs"
import * as path from "path"
import * as yaml from "js-yaml"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"
import * as Crypto from "crypto"
import * as FormData from "form-data"

const scriptPath = path.join(__dirname, "script", "api-v1-log.yaml")

function loadScript(path: string): TestScript {
  try {
    return yaml.load(fs.readFileSync(path, "utf8")) as TestScript
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

async function execScript(script: TestScript): Promise<void> {
  const url = (config: TestWebApi): string => {
    return `${ config.protocol }://${ config.host }:${ config.port }`
  }

  const login = (username: string, password: string): Promise<string> => {
    return new Promise<string>((resolve: (token: string) => void, reject: (err? :any) => void) => {
      return setImmediate(() => {
        const uri = `${ url(script.main) }/api/v1/public-key`
        return Axios.get(uri)
        .then((res: AxiosResponse) => {
          const uri = `${ url(script.main) }/api/v1/login`
          const params = new URLSearchParams()
          params.append("username", username)
          params.append("password", Crypto.publicEncrypt(res.data.key, Buffer.from(password)).toString("base64"))
          params.append("encrypted", "true")
          return Axios.post(uri, params)
        })
        .then((res: AxiosResponse) => {
          return resolve(res.data.token)
        })
        .catch((err: Error | AxiosError) => {
          return reject(err)
        })
      })
    })
  }

  const query = (queries: TestWebApiQuery): string => {
    if (queries === null || queries === undefined) {
      return ""
    }

    return Object.keys(queries).reduce((acc: any, key: string) => {
      return `${ acc }&${ key }=${ queries[key] }`
    }, "").replace("&", "?")
  }

  const param = (bodies: TestWebApiBody, token: string): URLSearchParams => {
    const params = new URLSearchParams()
    for (let key of Object.keys(bodies)) {
      params.append(key, bodies[key])
    }
    params.append("token", token)
    return params
  }

  const upload = (name: string, file: string, description: string): FormData => {
    const form = new FormData()
    form.append(name, fs.createReadStream(path.join(__dirname, file)))
    form.append("description", description)
    return form
  }

  const result = (test: string, data: any, expect: any): void => {
    if (JSON.stringify(data) === JSON.stringify(expect)) {
      console.log(`Pass: ${ test }`)
    } else {
      console.log(`Fail: ${ test }`)
      console.log(`      data  -> ${ JSON.stringify(data) }`)
      console.log(`      expect-> ${ JSON.stringify(expect) }`)
    }
  }

  try {
    const token = await login(script.main.username, script.main.password)
    for (let request of script.main.request) {
      let res: AxiosResponse
      switch (request.method) {
        case "GET":
          res = await Axios.get(`${ url(script.main) }${ request.path }${ query(request.query) }`, {
            headers : { "X-Access-Token": token },
            data    : {}
          })
          break

        case "POST":
          if (request.file) {
            const form = upload(request.file.name, request.file.path, request.file.description)
            res = await Axios.post(`${ url(script.main) }${ request.path }`, form, {
              headers: {
                "X-Access-Token": token,
                ...form.getHeaders()
              }
            })
          } else {
            res = await Axios.post(`${ url(script.main) }${ request.path }`, param(request.body, token))
          }
          break

        case "PUT":
          res = await Axios.put(`${ url(script.main) }${ request.path }`, param(request.body, token))
          break

        case "DELETE":
          res = await Axios.delete(`${ url(script.main) }${ request.path }${ query(request.query) }`, {
            headers : { "X-Access-Token": token },
            data    : {}
          })
          break

        default:
          break
      }
      result(`[${ request.method }] ${ request.path }`, res.data, request.response)
    }
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

const script = loadScript(scriptPath)
execScript(script)
