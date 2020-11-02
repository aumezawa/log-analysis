import * as React from "react"

import Environment from "../../lib/environment"

import DropdownButton from "../parts/dropdown-button"

type NavigatorBarProps = {
  title?: string,
  label?: string,
  items?: Array<JSX.Element>
}

const NavigatorBar: React.FC<NavigatorBarProps> = ({
  title = "Navigation Bar",
  label = "Menu",
  items = []
}) => (
  <nav className="navbar navbar-dark bg-dark">
    <a className="navbar-brand" href={ Environment.getBaseUrl() }>{ title }</a>
    <DropdownButton label={ label } align="right" items={ items } />
  </nav>
)

export default NavigatorBar
