export default {
  isDomainSelectable: (privilege: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
        return true

      case "anonymous":
      case "none":
      default:
        return false
    }
  },

  isProjectCreatable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
        return true

      case "anonymous":
      case "none":
      default:
        return false
    }
  },

  isProjectOpenable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
        return true

      case "anonymous":
      case "none":
      default:
        return false
    }
  },

  isProjectClosable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
        return true

      case "anonymous":
      case "none":
      default:
        return false
    }
  },

  isProjectReOpenable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
        return true

      case "anonymous":
      case "none":
      default:
        return false
    }
  },

  isProjectDeletable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
        return true

      case "user":
        switch (domain) {
          case "public":
          case "private":
            return true

          default:
            return false
        }

      case "anonymous":
      case "none":
      default:
        return false
    }
  },

  isBundleUploadable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
      case "anonymous":
      case "none":
        return true

      default:
        return false
    }
  },

  isBundleOpenable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
      case "anonymous":
      case "none":
        return true

      default:
        return false
    }
  },

  isBundleDeletable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
        return true

      case "user":
        switch (domain) {
          case "public":
          case "private":
            return true

          default:
            return false
        }

      case "anonymous":
      case "none":
      default:
        return false
    }
  },

  isBundleDownloadable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
      case "user":
      case "anonymous":
      case "none":
        return true

      default:
        return false
    }
  },

  isInvitable: (privilege: string, domain: string) => {
    switch (privilege) {
      case "root":
      case "owner":
        switch (domain) {
          case "public":
            return true

          case "private":
          default:
            return false
        }

      case "user":
      case "anonymous":
      case "none":
      default:
        return false
    }
  }
}
