import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"

import ModalFrame from "../frames/modal-frame"
import Message from "../parts/message"
import ProgressBar from "../parts/progress-bar"
import FileUploadForm from "../sets/file-upload-form"

type BundleUploadBoxProps = {
  id      : string,
  domain? : string
  project?: string,
}

const defaultMessage = `Please select a upload file (.tgz) and input a bundle "description".`

const BundleUploadBox = React.memo<BundleUploadBoxProps>(({
  id      = null,
  domain  = null,
  project = null
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)
  const [formKey, clearFrom]    = useReducer(x => x + 1, 0)

  const data = useRef({
    message   : defaultMessage
  })

  const status = useRef({
    processing: false,
    done      : false,
    success   : false,
    progress  : 0
  })

  useEffect(() => {
    data.current.message = defaultMessage
    status.current.processing = false
    status.current.done = false
    status.current.success = false
    status.current.progress = 0
    clearFrom()
  }, [true])

  const handleSubmit = useCallback((name: string, obj: any, description: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/bundles`
    const params = new FormData()
    params.append("bundle", obj)
    params.append("description", description)

    status.current.processing = true
    status.current.done = false
    status.current.progress = 0
    forceUpdate()
    Axios.post(uri, params, {
      headers: { "X-Access-Token": Cookie.get("token") || "" },
      onUploadProgress: (progressEvent: any) => {
        status.current.progress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
        forceUpdate()
      }
    })
    .then((res: AxiosResponse) => {
      data.current.message = res.data.msg
      status.current.processing = false
      status.current.done = true
      status.current.success = true
      clearFrom()
    })
    .catch((err: AxiosError) => {
      data.current.message = err.response.data.msg
      status.current.processing = false
      status.current.done = true
      status.current.success = false
      clearFrom()
    })
  }, [domain, project])

  const handleCancel = useCallback(() => {
    data.current.message = defaultMessage
    status.current.processing = false
    status.current.done = false
    status.current.success = false
    status.current.progress = 0
    forceUpdate()
  }, [true])

  return (
    <ModalFrame
      id={ id }
      title="Log Bundle"
      message="Upload a log bundle."
      center={ false }
      body={
        <>
          <Message
            className="mb-0"
            message={ data.current.message }
            success={ status.current.done &&  status.current.success }
            failure={ status.current.done && !status.current.success }
          />
          <ProgressBar
            className="mb-3"
            progress={ status.current.progress }
          />
          <FileUploadForm
            key={ formKey }
            auxiliary="description"
            disabled={ !domain || !project || status.current.processing }
            accept=".tgz"
            onSubmit={ handleSubmit }
            onCancel={ handleCancel }
          />
        </>
      }
    />
  )
})

export default BundleUploadBox
