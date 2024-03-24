import * as React from "react"
import { useCallback } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import LoginBox from "../complexes/login-box"

type TokenUpdateModalProps = {
  id        : string,
  user?     : string,
  onDone?   : () => void
}

const TokenUpdateModal = React.memo<TokenUpdateModalProps>(({
  id        = "",
  user      = "",
  onDone    = undefined
}) => {
  const handleDone = useCallback(() => {
    if (onDone) {
      onDone()
    }
  }, [onDone])

  return (
    <ModalFrame
      id={ id }
      title="Token"
      message="Update validity period of your token."
      body={
        <LoginBox username={ user } redirect={ false } onDone={ handleDone } />
      }
    />
  )
})

export default TokenUpdateModal
