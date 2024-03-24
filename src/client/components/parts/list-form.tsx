import * as React from "react"
import { useRef, useEffect, useCallback, useReducer, useImperativeHandle } from "react"

type ListFormProps = {
  className?: string,
  labels?   : Array<string>,
  onChange? : (value: string) => void
}

const ListForm = React.memo(React.forwardRef<ListFormReference, ListFormProps>(({
  className = "",
  labels    = [],
  onChange  = undefined
}, ref) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef(labels.map(() => React.createRef<HTMLButtonElement>()))

  useEffect(() => {
    refs.current = labels.map(() => React.createRef<HTMLButtonElement>())
    forceUpdate()
  }, [labels.toString()])

  useImperativeHandle(ref, () => ({
    active: (target: number) => {
      refs.current.forEach((ref: React.RefObject<HTMLButtonElement>, index: number) => {
        if (!ref.current) {
          return
        }
        ref.current.className = (index === target) ? (ref.current.className + " active") : (ref.current.className.replace(" active", ""))
      })
    },
    clear: () => {
      refs.current.forEach((ref: React.RefObject<HTMLButtonElement>) => {
        if (!ref.current) {
          return
        }
        ref.current.className = ref.current.className.replace(" active", "")
      })
    }
  }), [labels.toString()])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    refs.current.forEach((ref: React.RefObject<HTMLButtonElement>, index: number) => {
      if (!ref.current) {
        return
      }
      if (index === labels.indexOf(e.currentTarget.value)) {
        ref.current.className = ref.current.className + " active"
      } else {
        ref.current.className = ref.current.className.replace(" active", "")
      }
    })
    if (onChange) {
      onChange(e.currentTarget.value)
    }
  }, [labels.toString(), onChange])

  return (
    <ul className={ `list-group ${ className }` }>
      {
        labels.map((label: string, index: number) => (
          <button
            ref={ refs.current[index] }
            key={ label }
            className="list-group-item list-group-item-action"
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
}), (prevProps: ListFormProps, nextProps: ListFormProps) => (
  (prevProps.className === nextProps.className)
  && (prevProps.labels?.toString() === nextProps.labels?.toString())
  && (prevProps.onChange === nextProps.onChange)
))

export default ListForm
