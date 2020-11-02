import * as React from "react"
import { useState, useEffect, useCallback } from "react"

type ListFormProps = {
  className?: string,
  labels?   : Array<string>,
  reload?   : number,
  onChange? : (value: string) => void
}

const ListForm = React.memo<ListFormProps>(({
  className = "",
  labels    = [],
  reload    = 0,
  onChange  = undefined
}) => {
  const [active, setActive] = useState<string>(null)

  useEffect(() => {
    setActive(null)
  }, [labels.toString(), reload])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
    setActive(e.currentTarget.value)
  }, [onChange])

  return (
    <ul className={ `list-group ${ className }` }>
      {
        labels.map((label: string) => (
          <button
            key={ label }
            className={ `list-group-item list-group-item-action ${ (label === active) && "active" }` }
            type="button"
            value={ label }
            onClick={ handleClick }
          >
            { label }
          </button>
        ))
      }
    </ul>
  )
}, (prevProps: ListFormProps, nextProps: ListFormProps) => (
  (prevProps.className === nextProps.className)
  && (prevProps.labels.toString() === nextProps.labels.toString())
  && (prevProps.reload === nextProps.reload)
  && (prevProps.onChange === nextProps.onChange)
))

export default ListForm
