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
  className?          : string,
  path?               : string,
  line?               : number,
  textFilter?         : string,
  dateFrom?           : string,
  dateTo?             : string,
  onChangeLine?       : (line: number) => void,
  onChangeTextFilter? : (textFilter: string) => void,
  onChangeDateFilter? : (dateFrom: string, dateTo: string) => void
}

const FunctionalTableBox = React.memo<FunctionalTableBoxProps>(({
  className           = "",
  path                = null,
  line                = null,
  textFilter          = null,
  dateFrom            = null,
  dateTo              = null,
  onChangeLine        = undefined,
  onChangeTextFilter  = undefined,
  onChangeDateFilter  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content: null
  })

  const status = useRef({
    processing: false
  })

  useEffect(() => {
    if (path) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=json`
      status.current.processing = true
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.content = res.data.content
        status.current.processing = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.content = null
        status.current.processing = false
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

  const handleChangeTextFilter = useCallback((textFilter: string) => {
    if (onChangeTextFilter) {
      onChangeTextFilter(textFilter)
    }
  }, [onChangeTextFilter])

  const handleChangeDateFilter = useCallback((dateFrom: string, dateTo: string) => {
    if (onChangeDateFilter) {
      onChangeDateFilter(dateFrom, dateTo)
    }
  }, [onChangeDateFilter])

  return (
    <>
      {  status.current.processing && <Spinner /> }
      { !status.current.processing &&
        <FunctionalTable
          className={ className }
          content={ data.current.content }
          line={ line }
          textFilter={ textFilter }
          dateFrom={ dateFrom }
          dateTo={ dateTo }
          onChangeLine={ handleChangeLine }
          onChangeTextFilter={ handleChangeTextFilter }
          onChangeDateFilter={ handleChangeDateFilter }
        />
      }
    </>
  )
})

export default FunctionalTableBox
