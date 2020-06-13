import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"

import FunctionalTable from "../sets/functional-table"

type FunctionalTableBoxProps = {
  className?: string,
  path?     : string,
  line?     : number,
  onClick   : (line: number) => void
}

const FunctionalTableBox = React.memo<FunctionalTableBoxProps>(({
  className = "",
  path      = null,
  line      = null,
  onClick   = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content: null
  })

  useEffect(() => {
    if (path) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=json`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.content = res.data.content
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        alert(err.response.data.msg)
        return
      })
    } else {
      data.current.content = null
      forceUpdate()
    }
  }, [path])

  const handleClick = useCallback((line: number) => {
    if (onClick) {
      onClick(line)
    }
  }, [onClick])

  return (
    <>
      <FunctionalTable
        className={ className }
        content={ data.current.content }
        line={ line }
        onClick={ handleClick }
      />
    </>
  )
})

export default FunctionalTableBox
