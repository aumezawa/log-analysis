import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"
import * as Crypto from "crypto"

import Environment from "../../lib/environment"

import Message from "../parts/message"
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
    anonymous : false
  })

  const status = useRef({
    done      : false,
    success   : false
  })

  useEffect(() => {
    if (Environment.getUrlParam("anonymous") === "true") {
      data.current.anonymous = true
      forceUpdate()
    }
  }, [true])

  const handleSubmit = useCallback((username: string, password: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/public-key`

    status.current.done = false
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
      status.current.done = true
      status.current.success = true
      forceUpdate()
      setTimeout(() => {
        if (redirect) {
          if (params.has("request")) {
            location.href = `${ Environment.getBaseUrl() }${ decodeURIComponent(params.get("request")) }`
          } else {
            location.href = `${ Environment.getBaseUrl() }`
          }
        } else {
          data.current.message = defaultMessage
          status.current.done = false
          clearFrom()
          if (onDone) {
            onDone()
          }
        }
      }, 3000)
    })
    .catch((err: AxiosError) => {
      data.current.message = err.response.data.msg
      status.current.done = true
      status.current.success = false
      forceUpdate()
    })
  }, [redirect, onDone])

  const handleCancel = useCallback(() => {
    data.current.message = defaultMessage
    status.current.done = false
    status.current.success = false
    forceUpdate()
  }, [true])

  return (
    <div className={ className }>
      <Message
        message={ data.current.message }
        success={ status.current.done &&  status.current.success }
        failure={ status.current.done && !status.current.success }
      />
      <LoginForm
        key={ formKey }
        username={ username }
        disabled={ status.current.done && status.current.success }
        anonymous={ data.current.anonymous }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default LoginBox
