import * as React from "react"
import { useCallback } from "react"

import ButtonSet from "../set/button-set"

import MessageCard from "../part/message-card"

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
    location.href = `${ location.protocol }//${ location.host }/login`
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
        onSubmit={ handleSubmit }
      />
    </div>
  )
})

export default ErrorBox
