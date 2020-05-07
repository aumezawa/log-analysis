import * as React from "react"
import { useState, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import BundleUploadForm from "../set/bundle-upload-form"

import MessageCard from "../part/message-card"

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
  const [done,    setDone]    = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [formKey, clearFrom]  = useReducer(x => x + 1, 0)

  const message = useRef(`Please select a upload file (.tgz) and input a bundle "description".`)

  const handleSubmit = useCallback((name: string, obj: any, description: string) => {
    const uri = `${ location.protocol }//${ location.host }/api/v1/log/${ domain }/projects/${ project }/bundles`
    const params = new FormData()
    params.append("bundle", obj)
    params.append("description", description)

    setDone(false)
    Axios.post(uri, params, {
      headers : { "X-Access-Token": Cookie.get("token") || "" }
    })
    .then((res: AxiosResponse) => {
      message.current = res.data.msg
      setDone(true)
      setSuccess(true)
      clearFrom()
    })
    .catch((err: AxiosError) => {
      message.current = err.response.data.msg
      setDone(true)
      setSuccess(false)
    })
  }, [domain, project])

  const handleCancel = useCallback(() => {
    message.current = `Please select a upload file (.tgz) and input a bundle "description".`
    setDone(false)
    setSuccess(false)
  }, [true])

  return (
    <div className={ className }>
      <MessageCard
        message={ message.current }
        success={ done && success }
        failure={ done && !success }
      />
      <BundleUploadForm
        key={ formKey }
        disabled={ !domain || !project }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default BundleUploadBox
