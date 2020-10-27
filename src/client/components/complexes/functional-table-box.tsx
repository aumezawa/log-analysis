import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"

import FunctionalTable from "../sets/functional-table"
import Spinner from "../parts/spinner"

type FunctionalTableBoxProps = {
  className?      : string,
  path?           : string,
  line?           : number,
  filter?         : string,
  onChangeLine?   : (line: number) => void,
  onChangeFilter? : (filter: string) => void
}

const FunctionalTableBox = React.memo<FunctionalTableBoxProps>(({
  className       = "",
  path            = null,
  line            = null,
  filter          = null,
  onChangeLine    = undefined,
  onChangeFilter  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content: null
  })

  const status = useRef({
    progress: false
  })

  useEffect(() => {
    if (path) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=json`
      status.current.progress = true
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.content = res.data.content
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.content = null
        status.current.progress = false
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    } else {
      data.current.content = null
      forceUpdate()
    }
  }, [path])

  const handleChangeLine = useCallback((line: number) => {
    if (onChangeLine) {
      onChangeLine(line)
    }
  }, [onChangeLine])

  const handleChangeFilter = useCallback((filter: string) => {
    if (onChangeFilter) {
      onChangeFilter(filter)
    }
  }, [onChangeFilter])

  return (
    <>
      {  status.current.progress && <Spinner /> }
      { !status.current.progress &&
        <FunctionalTable
          className={ className }
          content={ data.current.content }
          line={ line }
          filter={ filter }
          onChangeLine={ handleChangeLine }
          onChangeFilter={ handleChangeFilter }
        />
      }
    </>
  )
})

export default FunctionalTableBox
