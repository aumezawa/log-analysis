import * as React from "react"

type MessageCardProps = {
  className?: string,
  message?  : string,
  success?  : boolean,
  warning?  : boolean,
  failure?  : boolean
}

const MessageCard = React.memo<MessageCardProps>(({
  className = "my-3",
  message   = "No message",
  success   = false,
  warning   = false,
  failure   = false
}) => {
  let color = "bg-info"

  color = (success) ? "bg-success" : color
  color = (warning) ? "bg-warning" : color
  color = (failure) ? "bg-danger"  : color

  return (
    <div className={ `card ${ className }` }>
      <div className={ `card-body ${ color }` }>
        { message }
      </div>
    </div>
  )
})

export default MessageCard
