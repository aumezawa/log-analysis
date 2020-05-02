import * as React from "react"
import { useState, useRef, useCallback } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as crypto from "crypto"

import LoginForm from "../set/login-form"

import MessageCard from "../part/message-card"

type LoginBoxProps = {
  className?  : string,
  redirectSec?: number
}

const LoginBox = React.memo<LoginBoxProps>(({
  className   = "",
  redirectSec = 3
}) => {
  const [done,    setDone]    = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const message = useRef(`Please input your "username" and "password". (between 4 - 16 characters with [0-9a-zA-Z])`)

  const handleSubmit = useCallback((data: {username: string, password: string}) => {
    let uri = `${ location.protocol }//${ location.host }/api/v1/public-key`

    setDone(false)
    Axios.get(uri)
    .then((res: AxiosResponse) => {
      let uri = `${ location.protocol }//${ location.host }/api/v1/login`
      let params = new URLSearchParams()
      params.append("username", data.username)
      params.append("password", crypto.publicEncrypt(res.data.key, Buffer.from(data.password)).toString("base64"))
      params.append("encrypted", "true")
      return Axios.post(uri, params)
    })
    .then((res: AxiosResponse) => {
      message.current = `Succeeded to login as "${ data.username }". Will redirect automatically in ${ redirectSec } sec.`
      setDone(true)
      setSuccess(true)
      setTimeout(() => location.href = `${ location.protocol }//${ location.host }?token=${ res.data.token }` , redirectSec * 1000)
    })
    .catch((err: AxiosError) => {
      message.current = `Failed to login as "${ data.username }"...`
      setDone(true)
      setSuccess(false)
    })
  }, [redirectSec])

  return (
    <div className={ className }>
      <MessageCard
        message={ message.current }
        success={ done && success }
        failure={ done && !success }
      />
      <LoginForm
        disabled={ success }
        onSubmit={ handleSubmit }
      />
    </div>
  )
})

export default LoginBox
