export default {
  encode: (domain: string = null, project: string = null, stats: string = null, counter: string = null, date_from: string = null, date_to: string = null) => {
    let path: string = null
    if (domain) {
      path = `stats/${ encodeURIComponent(domain) }`
      if (project) {
        path = `${ path }/projects/${ encodeURIComponent(project) }`
        if (stats) {
          path = `${ path }/stats/${ encodeURIComponent(stats) }`
          if (counter) {
            path = `${ path }/counters/${ encodeURIComponent(counter) }`
            let firstParam: boolean = true
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
