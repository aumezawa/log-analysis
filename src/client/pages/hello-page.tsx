import * as React from "react"

type HelloPageProps = {
  project?  : string,
  author?   : string,
  version?  : string,
  user?     : string,
  userAlias?: string
}

const HelloPage = React.memo<HelloPageProps>(({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none",
  user      = "anonymous",
  userAlias = "anonymous"
}) => {
  return (
    <div className="container-fluid">
      <div className="text-center">
        <p>Hello World.</p>
        <p>project = { project }</p>
        <p>author = { author }</p>
        <p>version = { version }</p>
        <p>user = { user }</p>
        <p>userAlias = { userAlias }</p>
      </div>
    </div>
  )
})

export default HelloPage
