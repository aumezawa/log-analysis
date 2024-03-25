import * as React from "react"

type IndexPageProps = {
  lang?     : string,
  project?  : string,
  desc?     : string,
  author?   : string,
  version?  : string,
  script?   : string,
  css?      : string,
  page?     : string,
  user?     : string,
  alias?    : string,
  privilege?: string,
  domains?  : string,
  query?    : string
}

const IndexPage = React.memo<IndexPageProps>(({
  lang      = "ja",
  project   = process.env.npm_package_name,
  desc      = "log analysis tools",
  author    = "aumezawa",
  version   = process.env.npm_package_version,
  script    = "/public/js/bundle.js",
  css       = "/public/css/default.css",
  page      = "main",
  user      = "anonymous",
  alias     = "anonymous",
  privilege = "none",
  domains   = "public,private",
  query     = ""
}) => (
  <html lang={ lang }>
    <head>
      <meta charSet="utf-8" />
      <title>{ project }</title>
      <meta name="description" content={ desc } />
      <meta name="author" content={ author } />
    </head>

    <body>
      <div id="render-main" data-project={ project } data-author={ author } data-version={ version } data-page={ page } data-user={ user } data-alias={ alias } data-privilege={ privilege } data-domains={ domains } data-query={ query }>
        <div id="unsupported-message" style={ { "color": "white" } }>
          <p>This page works with React library.</p>
          <p>If this message has been displayed, you may be using an unsupported browser.</p>
          <p>Please re-access with Chrome or Firefox. Thank you.</p>
        </div>
      </div>
      <script src={ script }></script>
      <link rel="stylesheet" href={ css } />
    </body>
  </html>
))

export default IndexPage
