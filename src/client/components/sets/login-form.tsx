import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import TextForm from "../parts/text-form"
import ButtonSet from "../sets/button-set"

type LoginFormProps = {
  className?  : string,
  username?   : string,
  domain?     : string,
  disabled?   : boolean,
  acceptUser? : RegExp,
  acceptPass? : RegExp,
  onSubmit?   : (username: string, password: string) => void,
  onCancel?   : () => void
}

const LoginForm = React.memo<LoginFormProps>(({
  className   = "",
  username    = null,
  domain      = null,
  disabled    = false,
  acceptUser  = /^[0-9a-zA-Z]{4,16}$/,
  acceptPass  = /^[0-9a-zA-Z]{4,16}$/,
  onSubmit    = undefined,
  onCancel    = undefined
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
      setValidUser(!!username.match(acceptUser))
    }
  }, [username])

  const handleChangeUsername = useCallback((value: string) => {
    if (!username) {
      data.current.username = value
      setValidUser(!!value.match(acceptUser))
    }
  }, [acceptUser])

  const handleChangePassword = useCallback((value: string) => {
    data.current.password = value
    setValidPass(!!value.match(acceptPass))
  }, [acceptPass])

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
