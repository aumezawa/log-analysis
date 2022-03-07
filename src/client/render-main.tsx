import * as React from "react"
import * as ReactDom from "react-dom"

import "bootstrap"
import "./css/bootstrap-custom.scss"

import MainPage from "./pages/main-page"
import StatsPage from "./pages/stats-page"
import LoginPage from "./pages/login-page"
import ErrorPage from "./pages/error-page"
import HelloPage from "./pages/hello-page"

// render on loaded
const main: HTMLElement = document.getElementById("render-main")
const project: string = main.getAttribute("data-project")
const author: string = main.getAttribute("data-author")
const version: string = main.getAttribute("data-version")
const user: string = main.getAttribute("data-user")
const alias: string = main.getAttribute("data-alias")
const privilege: string = main.getAttribute("data-privilege")
const domains: string = main.getAttribute("data-domains")
const query: string = main.getAttribute("data-query")
switch (main.getAttribute("data-page")) {
  case "main":
    ReactDom.render(<MainPage project={ project } author={ author } version={ version } user={ user } alias={ alias } privilege={ privilege } domains={ domains } query={ query } />, main)
    break

  case "stats":
    ReactDom.render(<StatsPage project={ project } author={ author } version={ version } user={ user } alias={ alias } privilege={ privilege } domains={ domains } query={ query } />, main)
    break

  case "login":
    ReactDom.render(<LoginPage project={ project } author={ author } version={ version } />, main)
    break

  case "error":
    ReactDom.render(<ErrorPage project={ project } author={ author } version={ version } />, main)
    break

  case "hello":
    ReactDom.render(<HelloPage project={ project } author={ author } version={ version } user={ user } alias={ alias } privilege={ privilege } domains={ domains } />, main)
    break

  default:
    break
}
