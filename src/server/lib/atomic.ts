import * as cluster from "cluster"

import logger = require("../lib/logger")

type RequestMessage = {
  signature : "RequestMessage",
  id        : string,
  source    : string,
  dest      : string,
  command   : string,
  options   : string
}

type ResponseMessage = {
  signature : "ResponseMessage",
  id        : string,
  source    : string,
  dest      : string,
  result    : boolean,
  detail    : string
}

const lockLedger = {} as { [key: string]: string }

function _lockSync(key: string, owner: string): boolean {
  if (key in lockLedger) {
    return false
  }

  logger.debug(`atomic: lock ${ key } by ${ owner }`)
  lockLedger[key] = owner
  return true
}

async function _lock(key: string, owner: string, trials: number = 1): Promise<void> {
  if (trials < 1) {
    throw new Error("Invalid number of trials")
  }

  if (_lockSync(key, owner)) {
    return
  }

  for (let i = 1; i < trials; i++) {
    await new Promise<void>((resolve: () => void, reject: (err?: any) => void) => setTimeout(resolve, 1000))
    if (_lockSync(key, owner)) {
      return
    }
  }

  throw new Error("Busy resource")
}

function _unlockSync(key: string, owner: string): void {
  if ((key in lockLedger) && (lockLedger[key] === owner)) {
    logger.debug(`atomic: unlock ${ key } by ${ owner }`)
    delete lockLedger[key]
  }
  return
}

async function _unlock(key: string, owner: string): Promise<void> {
  return _unlockSync(key, owner)
}

//----------------------------------------------------------------------------//

export function init(): void {
  if (!cluster.isMaster) {
    return
  }

  for (const workerId in cluster.workers) {
    logger.debug(`atomic: initialize worker id=${ workerId }`)
    const worker = cluster.workers[workerId]
    worker.on("message", async (object: any) => {
      if (object && object.signature && object.signature === "RequestMessage" && object.dest && object.dest === "master") {
        const message = object as RequestMessage
        logger.debug(`atomic: recieve a request message from worker ${ message.source }`)

        let result: boolean
        let detail: string
        if (message.command === "lock") {
          try {
            await _lock(message.options, message.source, 3)
            result = true
            detail = ""
          } catch (err) {
            result = false
            detail = (err instanceof Error) ? err.message : "Failed command"
          }
        } else if (message.command === "unlock") {
          try {
            await _unlock(message.options, message.source)
            result = true
            detail = ""
          } catch (err) {
            result = false
            detail = (err instanceof Error) ? err.message : "Failed command"
          }
        } else {
          result = false
          detail = "Invalid command"
        }

        logger.debug(`atomic: send a response message to worker ${ message.source }`)
        return worker.send({
          signature : "ResponseMessage",
          id        : message.id,
          source    : message.dest,
          dest      : message.source,
          result    : result,
          detail    : detail
        })
      }
    })
  }
}


function _send(request: RequestMessage, timeoutSec: number): Promise<ResponseMessage> {
  return new Promise<ResponseMessage>((resolve: (res: ResponseMessage) => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      if (cluster.isMaster) {
        return reject(new Error("Not master function"))
      }

      const timer = setTimeout(() => {
        logger.debug(`atomic: timeout of the request message to master`)
        process.removeListener("message", responseListener)
        return reject(new Error("Timeout"))
      }, timeoutSec * 1000)

      const responseListener = (object: any) => {
        if (object && object.signature && object.signature === "ResponseMessage" && object.dest && object.dest === String(process.pid)) {
          logger.debug(`atomic: recieve a response message from master`)
          timer && clearTimeout(timer)
          process.removeListener("message", responseListener)
          resolve(object as ResponseMessage)
        }
      }

      process.on("message", responseListener)

      logger.debug(`atomic: send a request message to master`)
      process.send(request)
    })
  })
}

export function lock(key: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      if (cluster.isMaster) {
        return _lock(key, String(process.pid), 3)
        .then(() => {
          return resolve()
        })
        .catch((err: any) => {
          return reject(err)
        })
      } else {
        return _send({
          signature : "RequestMessage",
          id        : String(process.pid),
          source    : String(process.pid),
          dest      : "master",
          command   : "lock",
          options   : key
        }, 3)
        .then((message: ResponseMessage) => {
          return message.result ? resolve() : reject(new Error(message.detail))
        })
        .catch((err: any) => {
          return reject(err)
        })
      }
    })
  })
}


export function unlock(key: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (err?: any) => void) => {
    return setImmediate(() => {
      if (cluster.isMaster) {
        return _unlock(key, String(process.pid))
        .then(() => {
          return resolve()
        })
        .catch((err: any) => {
          return reject(err)
        })
      } else {
        return _send({
          signature : "RequestMessage",
          id        : String(process.pid),
          source    : String(process.pid),
          dest      : "master",
          command   : "unlock",
          options   : key
        }, 1)
        .then((message: ResponseMessage) => {
          return message.result ? resolve() : reject(new Error(message.detail))
        })
        .catch((err: any) => {
          return reject(err)
        })
      }
    })
  })
}
