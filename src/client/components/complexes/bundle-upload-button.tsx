import * as React from "react"
import { useRef } from "react"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import BundleUploadBox from "../complexes/bundle-upload-box"

type BundleUploadButtonProps = {
  className?: string,
  domain?   : string,
  project?  : string
}

const BundleUploadButton = React.memo<BundleUploadButtonProps>(({
  className = "",
  domain    = null,
  project   = null
}) => {
  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  return (
    <>
      <ModalFrame
        id={ id.current.modal }
        title="Log Bundle"
        message="Upload a log bundle."
        body={
          <BundleUploadBox
            domain={ domain }
            project={ project }
          />
        }
      />
      <button
        className={ `btn btn-info ${ className }` }
        type="button"
        disabled={ !domain || !project }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
      >
        { "Upload Bundle" }
      </button>
    </>
  )
})

export default BundleUploadButton
