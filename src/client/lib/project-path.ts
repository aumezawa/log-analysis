export default {
  encode: (domain: string = null, project: string = null, bundle: string = null, filepath: string = null, line: number = null, filter: string = null, date_from: string = null, date_to: string = null) => {
    let path: string = null
    if (domain) {
      path = `log/${ domain }`
      if (project) {
        path = `${ path }/projects/${ project }`
        if (bundle) {
          path = `${ path }/bundles/${ bundle }`
          if (filepath) {
            path = `${ path }/files/${ filepath }`
            let firstParam: boolean = true
            if (line) {
              path = `${ path }${ firstParam ? "?" : "&" }line=${ line }`
              firstParam = false
            }
            if (filter) {
              path = `${ path }${ firstParam ? "?" : "&" }filter=${ encodeURI(filter) }`
              firstParam = false
            }
            if (date_from) {
              path = `${ path }${ firstParam ? "?" : "&" }date_from=${ encodeURI(date_from) }`
              firstParam = false
            }
            if (date_to) {
              path = `${ path }${ firstParam ? "?" : "&" }date_to=${ encodeURI(date_to) }`
              firstParam = false
            }
          }
        }
      }
    }
    return path
  },

  strictEncodeFiles: (domain: string, project: string, bundle: string) => {
    return domain && project && bundle && `log/${ domain }/projects/${ project }/bundles/${ bundle }/files`
  },

  strictEncodeFilepath: (domain: string, project: string, bundle: string, filepath: string) => {
    return domain && project && bundle && filepath && `log/${ domain }/projects/${ project }/bundles/${ bundle }/files/${ filepath }`
  }
}
