export default {
  encode: (domain: string = "", project: string = "", bundle: string = "", filepath: string = "", line: number = 0, mark: string = "", filter: string = "", search: string = "", sensitive: boolean = true, date_from: string = "", date_to: string = "", merge: string = ""): string => {
    let path = ""
    if (domain) {
      path = `log/${ encodeURIComponent(domain) }`
      if (project) {
        path = `${ path }/projects/${ encodeURIComponent(project) }`
        if (bundle) {
          path = `${ path }/bundles/${ encodeURIComponent(bundle) }`
          if (filepath) {
            path = `${ path }/files/${ filepath.split("/").map((node: string) => encodeURIComponent(node)).join("/") }`
            let firstParam = true
            if (line > 0) {
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
            if (search) {
              path = `${ path }${ firstParam ? "?" : "&" }search=${ encodeURIComponent(search) }`
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
            if (merge) {
              path = `${ path }${ firstParam ? "?" : "&" }merge=${ encodeURIComponent(merge) }`
              firstParam = false
            }
          }
        }
      }
    }
    return path
  },

  strictEncodeFiles: (domain: string, project: string, bundle: string): string => {
    return domain && project && bundle && `log/${ encodeURIComponent(domain) }/projects/${ encodeURIComponent(project) }/bundles/${ encodeURIComponent(bundle) }/files`
  },

  strictEncodeFilepath: (domain: string, project: string, bundle: string, filepath: string): string => {
    return domain && project && bundle && filepath && `log/${ encodeURIComponent(domain) }/projects/${ encodeURIComponent(project) }/bundles/${ encodeURIComponent(bundle) }/files/${ filepath.split("/").map((node: string) => encodeURIComponent(node)).join("/") }`
  }
}
