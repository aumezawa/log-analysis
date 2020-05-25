import * as React from "react"
import { useState, useCallback } from "react"

type ListFormProps = {
  className?: string,
  labels?   : Array<string>,
  titles?   : Array<string>,
  filter?   : (label: string) => boolean,
  onChange? : (value: string) => void
}

const ListForm = React.memo<ListFormProps>(({
  className = "",
  labels    = [],
  titles    = [],
  filter    = undefined,
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
        labels.map((label: string, index: number) => {
          if (!filter || filter(label)) {
            return (
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
            )
          }
          return null
        })
      }
    </ul>
  )
})

export default ListForm
