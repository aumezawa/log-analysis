import * as React from "react"
import { useCallback } from "react"

import Environment from "../../lib/environment"

import MessageCard from "../parts/message-card"
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

  const handleSubmit = useCallback(() => {
    if (params.has("request")) {
      location.href = `${ Environment.getBaseUrl() }/login?request=${ params.get("request") }`
    } else {
      location.href = `${ Environment.getBaseUrl() }/login`
    }
  }, [true])

  return (
    <div className={ className }>
      <MessageCard
        message={ message }
        failure={ true }
      />
      <ButtonSet
        submit="Login Page"
        cancel=""
        valid={ true }
        onSubmit={ handleSubmit }
      />
    </div>
  )
})

export default ErrorBox
