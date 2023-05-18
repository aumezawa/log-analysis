import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"
import * as Zlib from "zlib"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"

import FunctionalTable from "../sets/functional-table"
import Spinner from "../parts/spinner"
import CenterText from "../parts/center-text"

type FunctionalTableBoxProps = {
  className?          : string,
  path?               : string,
  line?               : number,
  mark?               : string,
  textFilter?         : string,
  textSearch?         : string,
  textSensitive?      : boolean,
  dateFrom?           : string,
  dateTo?             : string,
  onChangeMark?       : (mark: string) => void,
  onChangeLine?       : (line: number) => void,
  onChangeTextFilter? : (textFilter: string, textSensitive: boolean) => void,
  onChangeTextSearch? : (textSearch: string, textSensitive: boolean) => void,
  onChangeDateFilter? : (dateFrom: string, dateTo: string) => void
}

const FunctionalTableBox = React.memo<FunctionalTableBoxProps>(({
  className           = "",
  path                = null,
  line                = null,
  mark                = null,
  textFilter          = null,
  textSearch          = null,
  textSensitive       = true,
  dateFrom            = null,
  dateTo              = null,
  onChangeLine        = undefined,
  onChangeMark        = undefined,
  onChangeTextFilter  = undefined,
  onChangeTextSearch  = undefined,
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
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=json&format=auto&gzip=true`
      status.current.processing = true
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (res.data.compression === "gzip" && res.data.content.type === "Buffer") {
          data.current.content = JSON.parse(Zlib.gunzipSync(Buffer.from(res.data.content.data)).toString("utf8"))
        } else {
          data.current.content = res.data.content
        }
        status.current.processing = false
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        data.current.content = null
        status.current.processing = false
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          alert(err.response.data.msg)
        } else {
          console.log(err)
        }
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

  const handleChangeMark = useCallback((mark: string) => {
    if (onChangeMark) {
      onChangeMark(mark)
    }
  }, [onChangeMark])

  const handleChangeTextFilter = useCallback((textFilter: string, textSensitive: boolean) => {
    if (onChangeTextFilter) {
      onChangeTextFilter(textFilter, textSensitive)
    }
  }, [onChangeTextFilter])

  const handleChangeTextSearch = useCallback((textSearch: string, textSensitive: boolean) => {
    if (onChangeTextSearch) {
      onChangeTextSearch(textSearch, textSensitive)
    }
  }, [onChangeTextSearch])

  const handleChangeDateFilter = useCallback((dateFrom: string, dateTo: string) => {
    if (onChangeDateFilter) {
      onChangeDateFilter(dateFrom, dateTo)
    }
  }, [onChangeDateFilter])

  const handleClickReload = useCallback((format: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=json&format=${ format }&gzip=true`
    status.current.processing = true
    forceUpdate()
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookies.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      if (res.data.compression === "gzip" && res.data.content.type === "Buffer") {
        data.current.content = JSON.parse(Zlib.gunzipSync(Buffer.from(res.data.content.data)).toString("utf8"))
      } else {
        data.current.content = res.data.content
      }
      status.current.processing = false
      forceUpdate()
      return
    })
    .catch((err: Error | AxiosError) => {
      data.current.content = null
      status.current.processing = false
      forceUpdate()
      if (Axios.isAxiosError(err)) {
        alert(err.response.data.msg)
      } else {
        console.log(err)
      }
      return
    })
  }, [path])

  const handleClickDownload = useCallback((textFilter: string, textSensitive: boolean, dateFrom: string, dateTo: string) => {
    let uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=download&gzip=true`
    uri = (textFilter)              ? `${ uri }&filter=${ encodeURIComponent(textFilter) }`  : uri
    uri = (textSensitive === false) ? `${ uri }&sensitive=false`                             : uri
    uri = (dateFrom)                ? `${ uri }&date_from=${ encodeURIComponent(dateFrom) }` : uri
    uri = (dateTo)                  ? `${ uri }&date_to=${ encodeURIComponent(dateTo) }`     : uri
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookies.get("token") || "" },
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
    .catch((err: Error | AxiosError) => {
      if (Axios.isAxiosError(err)) {
        alert(err.response.data.msg)
      } else {
        console.log(err)
      }
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
          mark={ mark }
          textFilter={ textFilter }
          textSearch={ textSearch }
          textSensitive={ textSensitive }
          dateFrom={ dateFrom }
          dateTo={ dateTo }
          onChangeLine={ handleChangeLine }
          onChangeMark={ handleChangeMark }
          onChangeTextFilter={ handleChangeTextFilter }
          onChangeTextSearch={ handleChangeTextSearch }
          onChangeDateFilter={ handleChangeDateFilter }
          onClickReload={ handleClickReload }
          onClickDownload={ handleClickDownload }
        />
      }
    </>
  )
})

export default FunctionalTableBox
