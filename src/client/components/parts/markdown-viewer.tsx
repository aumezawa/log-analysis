import * as React from "react"

import { Marked } from "@ts-stack/markdown"

type MarkdownViewerProps = {
  className?: string,
  content?  : string
}

const MarkdownViewer = React.memo<MarkdownViewerProps>(({
  className = "",
  content   = ""
}) => (
  <div dangerouslySetInnerHTML={ {__html: Marked.parse(content)} }></div>
))

export default MarkdownViewer
