import * as React from "react"
import * as ReactDOM from "react-dom"

import "bootstrap"
import "./css/bootstrap-custom.scss"

import HelloPage from "./page/hello-page"
import LoginPage from "./page/login-page"

// render on loaded
const main: HTMLElement = document.getElementById("render-main")
const project: string = main.getAttribute("data-project")
const author: string = main.getAttribute("data-author")
const version: string = main.getAttribute("data-version")
const user: string = main.getAttribute("data-user")
switch (main.getAttribute("data-page")) {
  case "main":
    ReactDOM.render(<HelloPage project={ project } author={ author } version={ version } user={ user } />, main)
    break

  case "login":
    ReactDOM.render(<LoginPage project={ project } author={ author } version={ version } />, main)
    break

  default:
    break
}
