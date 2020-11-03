import * as React from "react"

type MessageProps = {
  className?: string,
  message?  : string,
  success?  : boolean,
  warning?  : boolean,
  failure?  : boolean
}

const Message = React.memo<MessageProps>(({
  className = "my-3",
  message   = "No message",
  success   = false,
  warning   = false,
  failure   = false
}) => {
  let color: string = "alert-info"

  color = (success) ? "alert-success" : color
  color = (warning) ? "alert-warning" : color
  color = (failure) ? "alert-danger"  : color

  return (
    <div className={ `alert ${ color } ${ className }` } role="alert">
      { message }
    </div>
  )
})

export default Message
