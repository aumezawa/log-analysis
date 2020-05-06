import * as React from "react"
import { useRef } from "react"

import TabLabel from "../part/tab-label"
import TabItem from "../part/tab-item"

import uniqueId from "../../lib/uniqueId"

type TabFrameProps = {
  className?: string,
  labels    : Array<string>,
  items     : Array<JSX.Element>,
  refs      : Array<React.RefObject<HTMLAnchorElement>>,
  show?     : number,
  overflow? : boolean
}

const TabFrame: React.FC<TabFrameProps> = ({
  className = "",
  labels    = undefined,
  items     = undefined,
  refs      = undefined,
  show      = 0,
  overflow  = true
}) => {
  const id = useRef({
    label : "label-" + uniqueId(),
    item  : "item-"  + uniqueId()
  })

  return (
    <div className={ `${ className } flex-container-column` }>
      <ul className="nav nav-tabs nav-justified">
        {
          labels.map((label: string, index: number) => (
            <TabLabel
              ref={ refs[index] }
              key={ index.toString() }
              label={ label }
              labelId={ id.current.label + index }
              itemId={ id.current.item + index }
              active={ index === show }
            />
          ))
        }
      </ul>
      <div className={ `flex-main-area ${ overflow && "flex-main-overflow" }` }>
        {
          items.map((item: JSX.Element, index: number) => (
            <TabItem
              key={ index.toString() }
              item={ item }
              labelId={ id.current.label + index }
              itemId={ id.current.item + index }
              active={ index === show }
            />
          ))
        }
      </div>
    </div>
  )
}

export default TabFrame
