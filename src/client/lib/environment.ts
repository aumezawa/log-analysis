export default {
  getLanguage: (): string => (
    (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language
  ),

  getUtcOffset: (): number => (
    new Date().getTimezoneOffset() / -60
  ),

  getTimeZone: (): string => (
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ),

  getBaseUrl: (): string => (
    `${ location.protocol }//${ location.host }`
  ),

  getUrlParam: (url: string, param: string): string => {
    const params = url ? new URLSearchParams(decodeURIComponent(url)) : new URLSearchParams(decodeURIComponent(location.search))
    const retval = params.get(param)
    return (retval !== null) ? retval : ""
  },

  getAddressBar: (): string => (
    location.href
  ),

  getFullPath: (): string => (
    location.href
  ),

  getSubPath: (): string => (
    location.pathname
  ),

  getParams: (): string => (
    location.search
  ),

  updateTitle: (title: string): void => {
    document.title = title
  },

  updateAddressBar: (url: string, replace: boolean = false): void => {
    if (replace) {
      window.history.replaceState(null, "", url)
    } else {
      window.history.pushState(null, "", url)
    }
  },

  addPageBackForwardEvent: (func: () => void): void => {
    window.addEventListener("popstate", func)
  },

  removePageBackForwardEvent: (func: () => void): void => {
    window.removeEventListener("popstate", func)
  }
}
