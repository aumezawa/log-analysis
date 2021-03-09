export default {
  getLanguage: () => (
    (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language
  ),

  getUtcOffset: () => (
    new Date().getTimezoneOffset() / -60
  ),

  getTimeZone: () => (
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ),

  getBaseUrl: () => (
    `${ location.protocol }//${ location.host }`
  ),

  updateTitle: (title: string) => {
    document.title = title
  },

  updateAddressBar: (url: string) => {
    window.history.replaceState(null, null, url)
  }
}
