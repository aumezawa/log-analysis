import * as React from "react"
import { useRef, useEffect, useCallback, useReducer, useImperativeHandle } from "react"

type MultiSelectFormProps = {
  className?: string,
  labels?   : Array<string>,
  limit?    : number,
  onChange? : (values: Array<string>) => void
}

const MultiSelectForm = React.memo(React.forwardRef<MultiSelectFormReference, MultiSelectFormProps>(({
  className = "",
  labels    = [],
  limit     = 0,
  onChange  = undefined
}, ref) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef(labels.map(() => React.createRef<HTMLButtonElement>()))

  const data = useRef<{[label: string]: string[]}>({
    actives : []
  })

  useEffect(() => {
    refs.current = labels.map(() => React.createRef<HTMLButtonElement>())
    data.current.actives = []
    forceUpdate()
  }, [labels.toString()])

  useImperativeHandle(ref, () => ({
    active: (targets: Array<number>) => {
      data.current.actives = labels.filter((label: string, index: number) => (targets.includes(index))).slice(0, limit)
      refs.current.forEach((ref: React.RefObject<HTMLButtonElement>, index: number) => {
        if (!ref.current) {
          return
        }
        ref.current.className = targets.includes(index) ? (ref.current.className + " active") : ref.current.className.replace(" active", "")
      })
    },
    clear: () => {
      data.current.actives = []
      refs.current.forEach((ref: React.RefObject<HTMLButtonElement>) => {
        if (!ref.current) {
          return
        }
        ref.current.className = ref.current.className.replace(" active", "")
      })
    }
  }), [labels.toString(), limit])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (data.current.actives.includes(e.currentTarget.value)) {
      data.current.actives = data.current.actives.filter((active: string) => (active !== e.currentTarget.value))
      e.currentTarget.className = e.currentTarget.className.replace(" active", "")
    } else {
      if (limit <= 0 || data.current.actives.length < limit) {
        data.current.actives.push(e.currentTarget.value)
        e.currentTarget.className = e.currentTarget.className + " active"
      }
    }
    if (onChange) {
      onChange(data.current.actives)
    }
  }, [labels.toString(), limit, onChange])

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
}), (prevProps: MultiSelectFormProps, nextProps: MultiSelectFormProps) => (
  (prevProps.className === nextProps.className)
  && (prevProps.labels?.toString() === nextProps.labels?.toString())
  && (prevProps.limit === nextProps.limit)
  && (prevProps.onChange === nextProps.onChange)
))

export default MultiSelectForm
