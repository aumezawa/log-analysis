import * as React from "react"

type TabItemProps = {
  className?: string,
  item?     : JSX.Element,
  labelId   : string,
  itemId    : string,
  hidden?   : boolean,
  active?   : boolean
}

const TabItem: React.FC<TabItemProps> = ({
  className = "",
  item      = <></>,
  labelId   = undefined,
  itemId    = undefined,
  hidden    = false,
  active    = false
}) => (
  <div
    className={ `tab-pane fade ${ hidden && "d-none" } ${ active && "show active" } ${ className }` }
    id={ itemId }
    role="tabpanel"
    aria-labelledby={ labelId }
  >
    { item }
  </div>
)

export default TabItem
