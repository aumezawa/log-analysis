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
const main = document.getElementById("render-main")

if (main) {
  const project   = main.getAttribute("data-project")   || undefined
  const author    = main.getAttribute("data-author")    || undefined
  const version   = main.getAttribute("data-version")   || undefined
  const user      = main.getAttribute("data-user")      || undefined
  const alias     = main.getAttribute("data-alias")     || undefined
  const privilege = main.getAttribute("data-privilege") || undefined
  const domains   = main.getAttribute("data-domains")   || undefined
  const query     = main.getAttribute("data-query")     || undefined

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
}
