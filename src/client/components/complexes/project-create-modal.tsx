import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"

import ModalFrame from "../frames/modal-frame"
import Message from "../parts/message"
import MultiTextForm from "../sets/multi-text-form"

type ProjectCreateModalProps = {
  id        : string,
  domain?   : string,
  onSubmit? : (projectName: string) => void
}

const defaultMessage = `Please input a new project "name" and "description". (characters with [0-9a-zA-Z#@_+-])`

const ProjectCreateModal = React.memo<ProjectCreateModalProps>(({
  id        = null,
  domain    = null,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
  const [formKey, clearFrom]   = useReducer(x => x + 1, 0)

  const data = useRef({
    message : defaultMessage
  })

  const status = useRef({
    done    : false,
    success : false
  })

  useEffect(() => {
    data.current.message = defaultMessage
    status.current.done = false
    status.current.success = false
    clearFrom()
  }, [domain])

  const handleSubmit = useCallback((name: string, description: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain) }/projects`
    const params = new URLSearchParams()
    params.append("name", name)
    params.append("description", description)
    params.append("token", Cookies.get("token") || "")

    status.current.done = false
    forceUpdate()
    Axios.post(uri, params)
    .then((res: AxiosResponse) => {
      data.current.message = res.data.msg
      status.current.done = true
      status.current.success = true
      if (onSubmit) {
        onSubmit(name)
      }
      clearFrom()
      return
    })
    .catch((err: Error | AxiosError) => {
      if (Axios.isAxiosError(err)) {
        data.current.message = err.response.data.msg
      } else {
        data.current.message = "An error on the client occurred."
        console.log(err)
      }
      status.current.done = true
      status.current.success = false
      forceUpdate()
      return
    })
  }, [domain, onSubmit])

  const handleCancel = useCallback(() => {
    data.current.message = defaultMessage
    status.current.done = false
    status.current.success = false
    forceUpdate()
  }, [true])

  return (
    <ModalFrame
      id={ id }
      title="Project"
      message="Create a new project."
      size="modal-lg"
      center={ false }
      body={
        <>
          <Message
            message={ data.current.message }
            success={ status.current.done &&  status.current.success }
            failure={ status.current.done && !status.current.success }
          />
          <MultiTextForm
            key={ formKey }
            label="project name"
            auxiliary="description"
            button="Create"
            accept={ /^[0-9a-zA-Z#@_+-]{1,}$/ }
            disabled={ !domain }
            onSubmit={ handleSubmit }
            onCancel={ handleCancel }
          />
        </>
      }
    />
  )
})

export default ProjectCreateModal
