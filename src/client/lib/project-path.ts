export default {
  encode: (domain: string = null, project: string = null, bundle: string = null, filepath: string = null, line: number = null, mark: string = null, filter: string = null, sensitive: boolean = true, date_from: string = null, date_to: string = null) => {
    let path: string = null
    if (domain) {
      path = `log/${ encodeURIComponent(domain) }`
      if (project) {
        path = `${ path }/projects/${ encodeURIComponent(project) }`
        if (bundle) {
          path = `${ path }/bundles/${ encodeURIComponent(bundle) }`
          if (filepath) {
            path = `${ path }/files/${ filepath.split("/").map((node: string) => encodeURIComponent(node)).join("/") }`
            let firstParam: boolean = true
            if (line) {
              path = `${ path }${ firstParam ? "?" : "&" }line=${ encodeURIComponent(line) }`
              firstParam = false
            }
            if (mark) {
              path = `${ path }${ firstParam ? "?" : "&" }mark=${ encodeURIComponent(mark) }`
              firstParam = false
            }
            if (filter) {
              path = `${ path }${ firstParam ? "?" : "&" }filter=${ encodeURIComponent(filter) }`
              firstParam = false
            }
            if (sensitive === false) {
              path = `${ path }${ firstParam ? "?" : "&" }sensitive=false`
              firstParam = false
            }
            if (date_from) {
              path = `${ path }${ firstParam ? "?" : "&" }date_from=${ encodeURIComponent(date_from) }`
              firstParam = false
            }
            if (date_to) {
              path = `${ path }${ firstParam ? "?" : "&" }date_to=${ encodeURIComponent(date_to) }`
              firstParam = false
            }
          }
        }
      }
    }
    return path
  },

  strictEncodeFiles: (domain: string, project: string, bundle: string) => {
    return domain && project && bundle && `log/${ encodeURIComponent(domain) }/projects/${ encodeURIComponent(project) }/bundles/${ encodeURIComponent(bundle) }/files`
  },

  strictEncodeFilepath: (domain: string, project: string, bundle: string, filepath: string) => {
    return domain && project && bundle && filepath && `log/${ encodeURIComponent(domain) }/projects/${ encodeURIComponent(project) }/bundles/${ encodeURIComponent(bundle) }/files/${ filepath.split("/").map((node: string) => encodeURIComponent(node)).join("/") }`
  }
}
