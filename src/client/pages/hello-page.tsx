import * as React from "react"
import { useEffect } from "react"

import Environment from "../lib/environment"

type HelloPageProps = {
  project?  : string,
  author?   : string,
  version?  : string,
  user?     : string,
  alias?    : string,
  privilege?: string,
  domains?  : string
}

const HelloPage: React.FC<HelloPageProps> = ({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none",
  user      = "anonymous",
  alias     = "anonymous",
  privilege = "none",
  domains   = "public,private"
}) => {

  useEffect(() => {
    Environment.updateTitle(`Hello World - ${ project }`)
  }, [true])

  return (
    <div className="container-fluid">
      <div className="text-center">
        <p>Hello World.</p>
        <p>project = { project }</p>
        <p>author = { author }</p>
        <p>version = { version }</p>
        <p>user = { user }</p>
        <p>alias = { decodeURIComponent(alias) }</p>
        <p>privilege = { privilege }</p>
        <p>domains = { domains }</p>
      </div>
    </div>
  )
}

export default HelloPage
