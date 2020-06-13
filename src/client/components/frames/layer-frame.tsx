import * as React from "react"

type LayerFrameProps = {
  className?: string,
  head?     : JSX.Element,
  body?     : JSX.Element,
  foot?     : JSX.Element,
  overflow? : boolean
}

const LayerFrame: React.FC<LayerFrameProps> = ({
  className = "",
  head      = <></>,
  body      = <></>,
  foot      = <></>,
  overflow  = true
}) => (
  <div className={ `flex-container-column ${ className }` }>
    <>
      { head }
    </>
    <div className={ `flex-main-area ${ overflow && "flex-main-overflow" }` }>
      <div className="flex-main-inner">
        { body }
      </div>
    </div>
    <>
      { foot }
    </>
  </div>
)

export default LayerFrame
