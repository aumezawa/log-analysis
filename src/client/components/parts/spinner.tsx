import * as React from "react"

type SpinnerProps = {
}

const Spinner: React.FC<SpinnerProps> = ({
}) => (
  <div className="flex-container-column justify-content-center">
    <div className="align-self-center spinner-border text-info" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
)

export default Spinner
