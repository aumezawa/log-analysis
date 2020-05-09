import * as React from "react"

type TabItemProps = {
  className?: string,
  item?     : JSX.Element,
  labelId   : string,
  itemId    : string,
  active?   : boolean
}

const TabItem: React.FC<TabItemProps> = ({
  className = "",
  item      = <></>,
  labelId   = undefined,
  itemId    = undefined,
  active    = false
}) => (
  <div
    className={ `tab-pane fade ${ active && "show active" } ${ className }` }
    id={ itemId }
    role="tabpanel"
    aria-labelledby={ labelId }
  >
    { item }
  </div>
)

export default TabItem
