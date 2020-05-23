import * as React from "react"
import { useRef } from "react"

import TabLabel from "../parts/tab-label"
import TabItem from "../parts/tab-item"

import UniqueId from "../../lib/unique-id"

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
    label : "label-" + UniqueId(),
    item  : "item-"  + UniqueId()
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
      <div className={ `tab-content flex-main-area ${ overflow && "flex-main-overflow" }` }>
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
