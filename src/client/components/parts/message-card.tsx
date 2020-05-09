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
}) => (
  <div className={ `${ className } card` }>
    <div className={ `card-body ${ success && "bg-success" } ${ failure && "bg-danger" } ${ success || failure || "bg-light" }` }>
      { message }
    </div>
  </div>
))

export default MessageCard
