import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"

import Message from "../parts/message"
import ProjectCreateForm from "../sets/project-create-form"

type ProjectCreateBoxProps = {
  className?: string,
  domain?   : string
}

const defaultMessage = `Please input a new project "name" and "description". (characters with [0-9a-zA-Z#@_+-])`

const ProjectCreateBox = React.memo<ProjectCreateBoxProps>(({
  className = "",
  domain    = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
  const [formKey, clearFrom]   = useReducer(x => x + 1, 0)

  const data = useRef({
    message : defaultMessage,
    done    : false,
    success : false
  })

  const handleSubmit = useCallback((name: string, description: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain) }/projects`
    const params = new URLSearchParams()
    params.append("name", name)
    params.append("description", description)
    params.append("token", Cookie.get("token") || "")

    data.current.done = false
    forceUpdate()
    Axios.post(uri, params)
    .then((res: AxiosResponse) => {
      data.current.message = res.data.msg
      data.current.done = true
      data.current.success = true
      clearFrom()
    })
    .catch((err: AxiosError) => {
      data.current.message = err.response.data.msg
      data.current.done = true
      data.current.success = false
      forceUpdate()
    })
  }, [domain])

  const handleCancel = useCallback(() => {
    data.current.message = defaultMessage
    data.current.done = false
    data.current.success = false
    forceUpdate()
  }, [true])

  return (
    <div className={ className }>
      <Message
        message={ data.current.message }
        success={ data.current.done && data.current.success }
        failure={ data.current.done && !data.current.success }
      />
      <ProjectCreateForm
        key={ formKey }
        disabled={ !domain }
        onSubmit={ handleSubmit }
        onCancel={ handleCancel }
      />
    </div>
  )
})

export default ProjectCreateBox
