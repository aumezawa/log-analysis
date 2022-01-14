import { useEffect } from "react"
import { MutableRefObject } from "react"

const useResizeObserver = (element: MutableRefObject<any>, callback: () => void) => {
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      callback()
    })

    element.current && resizeObserver.observe(element.current)

    return () => resizeObserver.disconnect()
  }, [])
}

export default useResizeObserver
