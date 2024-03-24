import * as React from "react"
import { useCallback } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import ModalFrame from "../../frames/modal-frame"
import ButtonSet from "../../sets/button-set"

type DownloadReportModalProps = {
  id        : string,
  domain?   : string,
  project?  : string,
  bundle?   : string
}

const DownloadReportModal = React.memo<DownloadReportModalProps>(({
  id        = "",
  domain    = "",
  project   = "",
  bundle    = ""
}) => {
  const handleDownload = useCallback(() => {
    Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/report`, {
      headers       : { "X-Access-Token": Cookies.get("token") || "" },
      responseType  : "arraybuffer",
      data          : {}
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
      alert(err.response!.data.msg)
      return
    })
  }, [domain, project, bundle])

  return (
    <ModalFrame
      id={ id }
      title="Download Report (WIP)"
      message="press [Download] button"
      body={
        <></>
      }
      foot={
        <ButtonSet
          submit="Download"
          cancel="Close"
          valid={ true }
          dismiss="modal"
          onSubmit={ handleDownload }
        />
      }
    />
  )
})

export default DownloadReportModal
