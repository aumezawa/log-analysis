import { useEffect } from "react"
import { MutableRefObject } from "react"

const useResizeObserver = (element: MutableRefObject<any>, callback: () => void, deps: Array<any> = []) => {
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      callback()
    })

    element.current && resizeObserver.observe(element.current)

    return () => resizeObserver.disconnect()
  }, deps)
}

export default useResizeObserver
