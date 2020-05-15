type VmInfo = {
  name      : string,
  version   : string,
  cpus      : number,
  memory    : number,
  guest     : string,
  state     : string,
  nics      : Array<VirtualNicInfo>,
  disks     : Array<VirtualDiskInfo>,
  dpios     : Array<PassthruDeviceInfo>,
  vfs       : Array<VfNicInfo>
}

type VirtualNicInfo = {
  name      : string,
  device    : string,
  present   : boolean,
  slot      : number,
  mac       : string,
  portgroup : string
}

type VirtualDiskInfo = {
  name      : string,
  device    : string,
  present   : boolean,
  mode      : string
}

type PassthruDeviceInfo = {
  name      : string,
  present   : boolean,
  slot      : number,
  id        : string
}

type VfNicInfo = {
  name      : string,
  present   : boolean,
  slot      : number,
  id        : string,
  pfid      : string,
  mac       : string,
  portgroup : string
}
