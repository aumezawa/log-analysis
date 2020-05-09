import * as React from "react"

import DropdownButton from "../parts/dropdown-button"

type NavigatorBarProps = {
  title?: string,
  items?: Array<JSX.Element>
}

const NavigatorBar: React.FC<NavigatorBarProps> = ({
  title = "Navigation Bar",
  items = []
}) => (
  <nav className="navbar navbar-dark bg-dark">
    <div className="navbar-brand">{ title }</div>
    <DropdownButton label="Menu" align="right" items={ items } />
  </nav>
)

export default NavigatorBar
