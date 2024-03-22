export default {
  encode: (domain: string = "", project: string = "", stats: string = "", counter: string = "", date_from: string = "", date_to: string = ""): string => {
    let path = ""
    if (domain) {
      path = `stats/${ encodeURIComponent(domain) }`
      if (project) {
        path = `${ path }/projects/${ encodeURIComponent(project) }`
        if (stats) {
          path = `${ path }/stats/${ encodeURIComponent(stats) }`
          if (counter) {
            path = `${ path }/counters/${ encodeURIComponent(counter) }`
            let firstParam = true
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
  }
}
