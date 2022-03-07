import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Search } from "react-bootstrap-icons"

import ModalFrame from "../frames/modal-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type StatsDeleteModalProps = {
  id        : string,
  counter   : string,
  onSubmit? : (counter: string) => void
}

const StatsDeleteModal = React.memo<StatsDeleteModalProps>(({
  id        = null,
  counter   = null,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    text  : React.createRef<HTMLInputElement>(),
    list  : useRef({} as ListFormReference)
  })

  const data = useRef({
    filter      : "",
    counter     : null
  })

  useEffect(() => {
    data.current.filter = refs.current.text.current.value = ""
    data.current.counter = null
    refs.current.list.current.clear()
    forceUpdate()
  }, [counter])

  const handleChangeFilter = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter = value
      forceUpdate()
    }
  }, [true])

  const handleSelectCounter = useCallback((value: string) => {
    data.current.counter = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.counter)
    }
  }, [onSubmit])

  const listLabel = () => {
    if (counter === null) {
      return []
    }
    return counter.split(",").filter((val: string) => (val.toUpperCase().includes(data.current.filter.toUpperCase())))
  }

  return (
    <ModalFrame
      id={ id }
      title="Counter"
      message={ `Select to delete a counter.` }
      size="modal-lg"
      center={ false }
      body={
        <>
          <TextForm
            ref={ refs.current.text }
            className="mb-3"
            label={ <Search /> }
            valid={ true }
            onChange={ handleChangeFilter }
          />
          <ListForm
            ref={ refs.current.list }
            labels={ listLabel() }
            onChange={ handleSelectCounter }
          />
        </>
      }
      foot={
        <ButtonSet
          submit="Delete Counter"
          cancel="Cancel"
          valid={ !!data.current.counter }
          dismiss="modal"
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default StatsDeleteModal
