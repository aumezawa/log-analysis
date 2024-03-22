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

  updateTitle: (title: string): void => {
    document.title = title
  },

  updateAddressBar: (url: string): void => {
    window.history.replaceState("", "", url)
  }
}
