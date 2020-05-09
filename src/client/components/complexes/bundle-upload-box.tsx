import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import MessageCard from "../parts/message-card"
import ProgressBar from "../parts/progress-bar"
import BundleUploadForm from "../sets/bundle-upload-form"

type BundleUploadBoxProps = {
  className?: string,
  domain?   : string
  project?  : string,
}

const BundleUploadBox = React.memo<BundleUploadBoxProps>(({
  className = "",
  domain    = null,
  project   = null
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)
  const [formKey, clearFrom]    = useReducer(x => x + 1, 0)

  const message = useRef(`Please select a upload file (.tgz) and input a bundle "description".`)

  const data = useRef({
    done      : false,
    success   : false,
    uploading : false,
    progress  : 0,
  })

  const handleSubmit = useCallback((name: string, obj: any, description: string) => {
    const uri = `${ location.protocol }//${ location.host }/api/v1/log/${ domain }/projects/${ project }/bundles`
    const params = new FormData()
    params.append("bundle", obj)
    params.append("description", description)

    data.current.done = false
    data.current.uploading = true
    data.current.progress = 0
    forceUpdate()
    Axios.post(uri, params, {
      headers: { "X-Access-Token": Cookie.get("token") || "" },
      onUploadProgress: (progressEvent: any) => {
        data.current.progress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
        forceUpdate()
      }
    })
    .then((res: AxiosResponse) => {
      message.current = res.data.msg
      data.current.done = true
      data.current.success = true
      data.current.uploading = false
      clearFrom()
    })
    .catch((err: AxiosError) => {
      message.current = err.response.data.msg
      data.current.done = true
      data.current.success = false
      data.current.uploading = false
      clearFrom()
    })
  }, [domain, project])

  const handleCancel = useCallback(() => {
    message.current = `Please select a upload file (.tgz) and input a bundle "description".`
    data.current.done = false
    data.current.success = false
    data.current.uploading = false
    data.current.progress = 0
    forceUpdate()
  }, [true])

  return (
    <div className={ className }>
      <MessageCard
        className=""
        message={ message.current }
        success={ data.current.done && data.current.success }
        failure={ data.current.done && !data.current.success }
      />
      <ProgressBar
        className="mb-3"
        progress={ data.current.progress }
      />
      <BundleUploadForm
        key={ formKey }
        disabled={ !domain || !project || data.current.uploading }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default BundleUploadBox
