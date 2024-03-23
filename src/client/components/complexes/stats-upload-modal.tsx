import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path-stats"

import ModalFrame from "../frames/modal-frame"
import Message from "../parts/message"
import ProgressBar from "../parts/progress-bar"
import FileUploadForm from "../sets/file-upload-form"

type StatsUploadBoxProps = {
  id        : string,
  domain?   : string
  project?  : string,
  autoClose?: number,
  onSubmit? : (statsId: string, statsName: string) => void
}

const defaultMessage = `Please select a upload file (.csv) and input a stats "description".`

const StatsUploadBox = React.memo<StatsUploadBoxProps>(({
  id        = "",
  domain    = "",
  project   = "",
  autoClose = 3,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)
  const [formKey, clearFrom]    = useReducer(x => x + 1, 0)

  const refs = useRef({
    btn : React.createRef<HTMLButtonElement>(),
  })

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

  const handleSubmit = useCallback((name: string, obj: any, description: string, preserve: boolean = false) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/stats`
    const params = new FormData()
    params.append("stats", obj)
    params.append("description", description)

    data.current.message = "Please wait for uploading the stats."
    status.current.processing = true
    status.current.done = false
    status.current.progress = 0
    forceUpdate()
    Axios.post(uri, params, {
      headers: { "X-Access-Token": Cookies.get("token") || "" },
      onUploadProgress: (progressEvent: any) => {
        status.current.progress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
        if (status.current.progress === 100) {
          data.current.message = "Uploading had done successfully. Please wait for analyzing the stats. It may take over 10 minutes. If not done, please reload the page."
        }
        forceUpdate()
      }
    })
    .then((res: AxiosResponse) => {
      data.current.message = res.data.msg
      status.current.processing = false
      status.current.done = true
      status.current.success = true
      status.current.progress = 0
      if (onSubmit) {
        onSubmit(String(res.data.id), res.data.name)
      }
      clearFrom()
      if (autoClose >= 0 && autoClose <= 10) {
        setTimeout(() => refs.current.btn.current?.click(), autoClose * 1000)
      }
      return
    })
    .catch((err: Error | AxiosError) => {
      if (Axios.isAxiosError(err)) {
        data.current.message = err.response!.data.msg
      } else {
        data.current.message = "An error on the client occurred."
        console.log(err)
      }
      status.current.processing = false
      status.current.done = true
      status.current.success = false
      status.current.progress = 0
      clearFrom()
      return
    })
  }, [domain, project, onSubmit])

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
      ref={ refs.current.btn }
      id={ id }
      title="Stats"
      message="Upload a performance data."
      size="modal-lg"
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
            accept=".csv"
            onSubmit={ handleSubmit }
            onCancel={ handleCancel }
          />
        </>
      }
    />
  )
})

export default StatsUploadBox
