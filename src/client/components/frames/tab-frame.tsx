import * as React from "react"
import { useRef } from "react"

import { Icon } from "react-bootstrap-icons"

import TabLabel from "../parts/tab-label"
import TabItem from "../parts/tab-item"

import UniqueId from "../../lib/unique-id"

type TabFrameProps = {
  className?: string,
  labels    : Array<string>,
  LIcons?   : Array<Icon>,
  items     : Array<JSX.Element>,
  refs      : Array<React.RefObject<HTMLAnchorElement>>,
  hiddens?  : Array<boolean>,
  show?     : number,
  overflow? : boolean,
  inmodal?  : boolean,
  onClicks? : Array<() => void>
}

const TabFrame: React.FC<TabFrameProps> = ({
  className = "",
  labels    = [],
  LIcons    = [],
  items     = [],
  refs      = [],
  hiddens   = [],
  show      = 0,
  overflow  = true,
  inmodal   = false,
  onClicks  = []
}) => {
  const id = useRef({
    label : "label-" + UniqueId(),
    item  : "item-"  + UniqueId()
  })

  return (
    <div className={ `flex-container-column ${ className }` }>
      <ul className="nav nav-tabs nav-justified">
        {
          labels.map((label: string, index: number) => (
            <TabLabel
              ref={ refs[index] }
              key={ `${ index }` }
              label={ label }
              LIcon={ LIcons[index] }
              labelId={ id.current.label + index }
              itemId={ id.current.item + index }
              hidden={ hiddens[index] }
              active={ index === show }
              onClick={ onClicks[index] }
            />
          ))
        }
      </ul>
      <div className={ `tab-content ${ inmodal ? "" : "flex-main-area" } ${ overflow ? "flex-main-overflow" : "" }` }>
        {
          items.map((item: JSX.Element, index: number) => (
            <TabItem
              key={ `${ index }` }
              item={ item }
              labelId={ id.current.label + index }
              itemId={ id.current.item + index }
              hidden={ hiddens[index] }
              active={ index === show }
            />
          ))
        }
      </div>
    </div>
  )
}

export default TabFrame
