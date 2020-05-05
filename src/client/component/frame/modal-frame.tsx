import * as React from "react"
import { useRef } from "react"

import uniqueId from "../../lib/uniqueId"

type ModalFrameProps = {
  id      : string,
  title?  : string,
  message?: string,
  size?   : "modal-lg" | "modal-xl",
  body?   : JSX.Element,
  foot?   : JSX.Element
}

const ModalFrame: React.FC<ModalFrameProps> = ({
  id      = undefined,
  title   = "Title",
  message = "No message",
  size    = "",
  body    = <>No content</>,
  foot    = <button className="btn btn-secondary" type="button" data-dismiss="modal">Close</button>
}) => {
  const localId = useRef({
    label: "label-" + uniqueId()
  })

  return (
    <div className="modal fade" id={ id } tabIndex={ -1 } role="dialog" aria-labelledby={ localId.current.label } aria-hidden="true">
      <div className={ `modal-dialog modal-dialog-centered modal-dialog-scrollable ${ size }` } role="document">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title" id={ localId.current.label }>
              <p className="h5">{ title }</p>
              <p className="h6 text-monospace text-wrap text-break">{ message }</p>
            </div>
            <button className="close" type="button" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            { body }
          </div>
          <div className="modal-footer">
            { foot }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalFrame
