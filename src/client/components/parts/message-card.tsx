import * as React from "react"

type MessageCardProps = {
  className?: string,
  message?  : string,
  success?  : boolean,
  failure?  : boolean
}

const MessageCard = React.memo<MessageCardProps>(({
  className = "my-3",
  message   = "No message",
  success   = false,
  failure   = false
}) => {
  let color: string = "bg-light"

  color = (success) ? "bg-success" : color
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
