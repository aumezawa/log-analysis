import * as React from "react"

type HelloPageProps = {
  project?  : string,
  author?   : string,
  version?  : string,
  user?     : string,
  alias?    : string,
  privilege?: string
}

const HelloPage = React.memo<HelloPageProps>(({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none",
  user      = "anonymous",
  alias     = "anonymous",
  privilege = "none"
}) => (
  <div className="container-fluid">
    <div className="text-center">
      <p>Hello World.</p>
      <p>project = { project }</p>
      <p>author = { author }</p>
      <p>version = { version }</p>
      <p>user = { user }</p>
      <p>alias = { decodeURI(alias) }</p>
      <p>privilege = { privilege }</p>
    </div>
  </div>
))

export default HelloPage
