type VCenterInfo = {
  format    : string,
  vcname    : string,
  version   : string,
  build     : string,
  uptime    : string,
  vsan      : VSanInfo
}

type VSanInfo = {
  name      : string,
  nodes     : Array<VSanNodeInfo>,
  disks     : Array<VSanDiskInfo>
}

type VSanNodeInfo = {
  name      : string,
  version   : string,
  role      : string,
  nic       : string,
  ip        : string,
  evacuated : boolean,
  efficiency: boolean,
  encryption: boolean
}

type VSanDiskInfo = {
  path      : string,
  type      : string,
  tier      : string,
  state     : string,
  size      : number,
  usage     : number
}