import * as React from "react"
import { useState, useCallback } from "react"

type ListFormProps = {
  className?: string,
  labels?   : Array<string>,
  titles?   : Array<string>,
  onChange? : (value: string) => void
}

const ListForm = React.memo<ListFormProps>(({
  className = "",
  labels    = [],
  titles    = [],
  onChange  = undefined
}) => {
  const [active, setActive] = useState<string>(null)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onChange) {
      onChange(e.currentTarget.value)
    }
    setActive(e.currentTarget.value)
  }, [onChange])

  return (
    <ul className={ `list-group ${ className }` }>
      {
        labels.map((label: string, index: number) => (
          <button
            key={ label }
            className={ `list-group-item list-group-item-action ${ (label === active) && "active" }` }
            type="button"
            title={ titles[index] }
            value={ label }
            onClick={ handleClick }
          >
            { label }
          </button>
        ))
      }
    </ul>
  )
})

export default ListForm
