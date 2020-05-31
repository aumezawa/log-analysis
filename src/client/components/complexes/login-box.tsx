import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"
import * as Crypto from "crypto"

import Environment from "../../lib/environment"

import MessageCard from "../parts/message-card"
import LoginForm from "../sets/login-form"

type LoginBoxProps = {
  className?: string,
  redirect? : boolean,
  onDone?   : () => void
}

const LoginBox = React.memo<LoginBoxProps>(({
  className = "",
  redirect  = true,
  onDone    = undefined
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)
  const [formKey, clearFrom]    = useReducer(x => x + 1, 0)

  const url = new URL(location.href)
  const params = new URLSearchParams(url.search)

  const message = useRef(`Please input your "username" and "password". (between 4 - 16 characters with [0-9a-zA-Z])`)

  const data = useRef({
    done      : false,
    success   : false
  })

  const handleSubmit = useCallback((username: string, password: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/public-key`

    data.current.done = false
    forceUpdate()
    Axios.get(uri)
    .then((res: AxiosResponse) => {
      const uri = `${ Environment.getBaseUrl() }/api/v1/login`
      const params = new URLSearchParams()
      params.append("username", username)
      params.append("password", Crypto.publicEncrypt(res.data.key, Buffer.from(password)).toString("base64"))
      params.append("encrypted", "true")
      return Axios.post(uri, params)
    })
    .then((res: AxiosResponse) => {
      Cookie.set("token", res.data.token)
      message.current = `${ res.data.msg }` + (redirect ? " Will redirect automatically in 3 sec." : "")
      data.current.done = true
      data.current.success = true
      forceUpdate()
      setTimeout(() => {
        if (redirect) {
          if (params.has("request")) {
            location.href = `${ Environment.getBaseUrl() }${ params.get("request") }`
          } else {
            location.href = `${ Environment.getBaseUrl() }`
          }
        } else {
          message.current = `Please input your "username" and "password". (between 4 - 16 characters with [0-9a-zA-Z])`
          data.current.done = false
          clearFrom()
          if (onDone) {
            onDone()
          }
        }
      }, 3000)
    })
    .catch((err: AxiosError) => {
      data.current.done = true
      data.current.success = false
      forceUpdate()
    })
  }, [redirect, onDone])

  return (
    <div className={ className }>
      <MessageCard
        message={ message.current }
        success={ data.current.done && data.current.success }
        failure={ data.current.done && !data.current.success }
      />
      <LoginForm
        key={ formKey }
        disabled={ data.current.done && data.current.success }
        onSubmit={ handleSubmit }
      />
    </div>
  )
})

export default LoginBox
