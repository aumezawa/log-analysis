import * as React from "react"
import { useState, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import MessageCard from "../parts/message-card"
import ProjectCreateForm from "../sets/project-create-form"

type ProjectCreateBoxProps = {
  className?: string,
  domain?   : string
}

const ProjectCreateBox = React.memo<ProjectCreateBoxProps>(({
  className = "",
  domain    = null
}) => {
  const [done,    setDone]    = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [formKey, clearFrom]  = useReducer(x => x + 1, 0)

  const message = useRef(`Please input a new project "name" and "description". (characters with [0-9a-zA-Z#@_+-])`)

  const handleSubmit = useCallback((name: string, description: string) => {
    const uri = `${ location.protocol }//${ location.host }/api/v1/log/${ domain }/projects`
    const params = new URLSearchParams()
    params.append("name", name)
    params.append("description", description)
    params.append("token", Cookie.get("token") || "")

    setDone(false)
    Axios.post(uri, params)
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
  }, [domain])

  const handleCancel = useCallback(() => {
    message.current = `Please input a new project "name" and "description". (characters with [0-9a-zA-Z#@_+-])`
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
