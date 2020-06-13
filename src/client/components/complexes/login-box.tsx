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
  username? : string,
  redirect? : boolean,
  onDone?   : () => void
}

const defaultMessage = `Please input your "username" and "password". (between 4 - 16 characters with [0-9a-zA-Z])`

const LoginBox = React.memo<LoginBoxProps>(({
  className = "",
  username  = null,
  redirect  = true,
  onDone    = undefined
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)
  const [formKey, clearFrom]    = useReducer(x => x + 1, 0)

  const url = new URL(location.href)
  const params = new URLSearchParams(url.search)

  const data = useRef({
    message   : defaultMessage,
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
      data.current.message = `${ res.data.msg }` + (redirect ? " Will redirect automatically in 3 sec." : "")
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
          data.current.message = defaultMessage
          data.current.done = false
          clearFrom()
          if (onDone) {
            onDone()
          }
        }
      }, 3000)
    })
    .catch((err: AxiosError) => {
      data.current.message = err.response.data.msg
      data.current.done = true
      data.current.success = false
      forceUpdate()
    })
  }, [redirect, onDone])

  const handleCancel = useCallback(() => {
    data.current.message = defaultMessage
    data.current.done = false
    data.current.success = false
    forceUpdate()
  }, [true])

  return (
    <div className={ className }>
      <MessageCard
        message={ data.current.message }
        success={ data.current.done && data.current.success }
        failure={ data.current.done && !data.current.success }
      />
      <LoginForm
        key={ formKey }
        username={ username }
        disabled={ data.current.done && data.current.success }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default LoginBox
