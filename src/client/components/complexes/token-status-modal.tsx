import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"

type TokenStatusModalProps = {
  id  : string
}

const TokenStatusModal = React.memo<TokenStatusModalProps>(({
  id  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    iat: null,
    exp: null,
  })

  useEffect(() => {
    const uri = `${ location.protocol }//${ location.host }/api/v1/token`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.iat = res.data.IssueAt
      data.current.exp = res.data.ExpirationTime
      forceUpdate()
      return
    })
    .catch((err: AxiosError) => {
      data.current.iat = null
      data.current.exp = null
      forceUpdate()
      return
    })
  }, [true])

  return (
    <ModalFrame
      id={ id }
      title="Token"
      message="Validity period of your token is in the below."
      body={
        <p className="h6 text-monospace">{ `${ data.current.iat } ~ ${ data.current.exp }` }</p>
      }
    />
  )
})

export default TokenStatusModal
