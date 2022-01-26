import * as React from "react"
import { useEffect, useCallback } from "react"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"

import Message from "../parts/message"
import ButtonSet from "../sets/button-set"

type ErrorBoxProps = {
  className?: string
}

const ErrorBox = React.memo<ErrorBoxProps>(({
  className = "",
}) => {
  const url = new URL(location.href)
  const params = new URLSearchParams(url.search)

  let message: string
  switch (params.get("type") || "unknown") {
    case "page":
      message = "No page found..."
      break

    case "token":
      message = "Your access token is invalid..."
      break

    default:
      message = "Unknown error or no error."
      break
  }

  useEffect(()=> {
    if (params.get("type") === "token") {
      Cookies.remove("token")
    }
  }, [true])

  const handleSubmit = useCallback(() => {
    if (params.has("request")) {
      location.href = `${ Environment.getBaseUrl() }/login?request=${ encodeURIComponent(params.get("request")) }`
    } else {
      location.href = `${ Environment.getBaseUrl() }/login`
    }
  }, [true])

  return (
    <div className={ className }>
      <Message
        message={ message }
        failure={ true }
      />
      <ButtonSet
        submit="Login Page"
        cancel={ null }
        valid={ true }
        onSubmit={ handleSubmit }
      />
    </div>
  )
})

export default ErrorBox
