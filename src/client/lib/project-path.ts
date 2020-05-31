export default {
  encode: (domain: string = null, project: string = null, bundle: string = null, filepath: string = null) => {
    let path: string = null
    if (domain) {
      path = `log/${ domain }`
      if (project) {
        path = `${ path }/projects/${ project }`
        if (bundle) {
          path = `${ path }/bundles/${ bundle }`
          if (filepath) {
            path = `${ path }/files/${ filepath }`
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
