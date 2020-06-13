import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import TextForm from "../parts/text-form"
import ButtonSet from "../sets/button-set"

type LoginFormProps = {
  className?: string,
  username? : string,
  domain?   : string,
  disabled? : boolean,
  onSubmit? : (username: string, password: string) => void,
  onCancel? : () => void,
  allowUser?: RegExp,
  allowPass?: RegExp
}

const LoginForm = React.memo<LoginFormProps>(({
  className = "",
  username  = null,
  domain    = null,
  disabled  = false,
  onSubmit  = undefined,
  onCancel  = undefined,
  allowUser = /^[0-9a-zA-Z]{4,16}$/,
  allowPass = /^[0-9a-zA-Z]{4,16}$/
}) => {
  const [validUser, setValidUser] = useState<boolean>(false)
  const [validPass, setValidPass] = useState<boolean>(false)

  const refs = useRef({
    username: React.createRef<HTMLInputElement>(),
    password: React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    username: "",
    password: ""
  })

  useEffect(() => {
    if (username) {
      data.current.username = refs.current.username.current.value = username
      setValidUser(!!username.match(allowUser))
    }
  }, [username])

  const handleChangeUsername = useCallback((value: string) => {
    if (!username) {
      data.current.username = value
      setValidUser(!!value.match(allowUser))
    }
  }, [allowUser])

  const handleChangePassword = useCallback((value: string) => {
    data.current.password = value
    setValidPass(!!value.match(allowPass))
  }, [allowPass])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.username, data.current.password)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    if (!username) {
      data.current.username = refs.current.username.current.value = ""
      setValidUser(false)
    }
    data.current.password = refs.current.password.current.value = ""
    setValidPass(false)
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <div className={ className }>
      <TextForm
        ref={ refs.current.username }
        className="mb-3"
        valid={ validUser }
        label="username"
        auxiliary={ domain }
        disabled={ disabled || !!username }
        onChange={ handleChangeUsername }
      />
      <TextForm
        ref={ refs.current.password }
        className="mb-3"
        valid={ validPass }
        label="password"
        type="password"
        disabled={ disabled }
        onChange={ handleChangePassword }
      />
      <ButtonSet
        submit="Login"
        cancel="Clear"
        valid={ validUser && validPass }
        disabled={ disabled }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default LoginForm
