import * as React from "react"
import { useState, useRef, useCallback } from "react"

import ButtonSet from "../set/button-set"

import TextForm from "../part/text-form"

type LoginFormProps = {
  className?: string,
  disabled? : boolean,
  onSubmit? : (data: { username: string, password: string }) => void,
  onCancel? : () => void,
  allowUser?: RegExp,
  allowPass?: RegExp
}

const LoginForm = React.memo<LoginFormProps>(({
  className = "mb-3",
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

  const handleChangeUsername = useCallback((value: string) => {
    data.current.username = value
    setValidUser(!!value.match(allowUser))
  }, [allowUser])

  const handleChangePassword = useCallback((value: string) => {
    data.current.password = value
    setValidPass(!!value.match(allowPass))
  }, [allowPass])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current)
    }
  }, [onSubmit])

  const handleCancel = useCallback(() => {
    data.current.username = refs.current.username.current.value = ""
    data.current.password = refs.current.password.current.value = ""
    setValidUser(false)
    setValidPass(false)
  }, [onCancel])

  return (
    <div className={ className }>
      <TextForm
        ref={ refs.current.username }
        valid={ validUser }
        label="username"
        disabled={ disabled }
        onChange={ handleChangeUsername }
      />
      <TextForm
        ref={ refs.current.password }
        valid={ validPass }
        label="password"
        type="password"
        disabled={ disabled }
        onChange={ handleChangePassword }
      />
      <ButtonSet
        className=""
        submit="Login"
        cancel="Clear"
        disabled={ disabled || !validUser || !validPass }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default LoginForm
