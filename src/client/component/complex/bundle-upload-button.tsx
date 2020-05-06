import * as React from "react"
import { useRef } from "react"

import uniqueId from "../../lib/uniqueId"

import BundleUploadBox from "../complex/bundle-upload-box"

import ModalFrame from "../frame/modal-frame"

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
    modal: "modal-" + uniqueId()
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
        className="btn btn-info"
        type="button"
        disabled={ !["public", "private"].includes(domain) || !project }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
      >
        { "Upload Bundle" }
      </button>
    </>
  )
})

export default BundleUploadButton
