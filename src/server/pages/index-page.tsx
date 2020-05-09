import * as React from "react"

type IndexPageProps = {
  lang?     : string,
  project?  : string,
  desc?     : string,
  author?   : string,
  version?  : string,
  script?   : string,
  page?     : string,
  user?     : string
}

const IndexPage = React.memo<IndexPageProps>(({
  lang      = "ja",
  project   = process.env.npm_package_name,
  desc      = process.env.npm_package_description,
  author    = process.env.npm_package_author_name,
  version   = process.env.npm_package_version,
  script    = "/public/js/bundle.js",
  page      = "main",
  user      = "anonymous"
}) => (
  <html lang={ lang }>
    <head>
      <meta charSet="utf-8" />
      <title>{ project }</title>
      <meta name="description" content={ desc } />
      <meta name="author" content={ author } />
    </head>

    <body>
      <div id="render-main" data-project={ project } data-author={ author } data-version={ version } data-page={ page } data-user={ user }>
        <div id="unsupported-message" className="text-center" style={ { "color": "white" } }>
          <p>This page works with React library.</p>
          <p>If this page won't change, you may be using an unsupported browser.</p>
          <p>Please re-access with Chrome or Firefox. Thank you.</p>
        </div>
      </div>
      <script src={ script }></script>
    </body>
  </html>
))

export default IndexPage
