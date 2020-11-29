import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"

import FunctionalTable from "../sets/functional-table"
import Spinner from "../parts/spinner"
import CenterText from "../parts/center-text"

type FunctionalTableBoxProps = {
  className?          : string,
  path?               : string,
  line?               : number,
  textFilter?         : string,
  textSensitive?      : boolean,
  dateFrom?           : string,
  dateTo?             : string,
  onChangeLine?       : (line: number) => void,
  onChangeTextFilter? : (textFilter: string, textSensitive: boolean) => void,
  onChangeDateFilter? : (dateFrom: string, dateTo: string) => void
}

const FunctionalTableBox = React.memo<FunctionalTableBoxProps>(({
  className           = "",
  path                = null,
  line                = null,
  textFilter          = null,
  textSensitive       = true,
  dateFrom            = null,
  dateTo              = null,
  onChangeLine        = undefined,
  onChangeTextFilter  = undefined,
  onChangeDateFilter  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    content   : null
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

  const handleChangeTextFilter = useCallback((textFilter: string, textSensitive: boolean) => {
    if (onChangeTextFilter) {
      onChangeTextFilter(textFilter, textSensitive)
    }
  }, [onChangeTextFilter])

  const handleChangeDateFilter = useCallback((dateFrom: string, dateTo: string) => {
    if (onChangeDateFilter) {
      onChangeDateFilter(dateFrom, dateTo)
    }
  }, [onChangeDateFilter])

  const handleClickDownload = useCallback((textFilter: string, textSensitive: boolean, dateFrom: string, dateTo: string) => {
    let uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=download`
    uri = (textFilter)              ? `${ uri }&filter=${ encodeURIComponent(textFilter) }`  : uri
    uri = (textSensitive === false) ? `${ uri }&sensitive=false`                             : uri
    uri = (dateFrom)                ? `${ uri }&date_from=${ encodeURIComponent(dateFrom) }` : uri
    uri = (dateTo)                  ? `${ uri }&date_to=${ encodeURIComponent(dateTo) }`     : uri
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {},
      responseType: "blob"
    })
    .then((res: AxiosResponse) => {
      const blob = new Blob([res.data], { type: res.data.type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      let filename: string
      const match = res.headers["content-disposition"].match(/filename="(.*)"(;|$)/)
      if (match) {
        filename = match[1]
        const matchUTF8 = res.headers["content-disposition"].match(/filename[*]=UTF-8''(.*)(;|$)/)
        if (matchUTF8) {
          filename = decodeURIComponent(matchUTF8[1])
        }
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      return
    })
    .catch((err: AxiosError) => {
      return
    })
  }, [path])

  return (
    <>
      {  status.current.processing && <Spinner /> }
      { !status.current.processing && !data.current.content && <CenterText text="No Data" /> }
      { !status.current.processing &&  data.current.content &&
        <FunctionalTable
          className={ className }
          content={ data.current.content }
          line={ line }
          textFilter={ textFilter }
          textSensitive={ textSensitive }
          dateFrom={ dateFrom }
          dateTo={ dateTo }
          onChangeLine={ handleChangeLine }
          onChangeTextFilter={ handleChangeTextFilter }
          onChangeDateFilter={ handleChangeDateFilter }
          onClickDownload={ handleClickDownload }
        />
      }
    </>
  )
})

export default FunctionalTableBox
