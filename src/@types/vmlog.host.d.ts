type HostInfo = {
  hostname  : string,
  version   : string,
  build     : string,
  hardware  : HostHardwareInfo,
  network   : HostNetworkInfo,
  storage   : HostStorageInfo,
  packages  : Array<HostPackageInfo>
}

type HostHardwareInfo = {
  machine   : string,
  cpu       : HostCpuInfo,
  memory    : number,
  cards     : Array<HostPciCardInfo>
}

type HostCpuInfo = {
  sockets   : number,
  cores     : number
}

type HostPciCardInfo = {
  slot      : number,
  device    : string
}

type HostNetworkInfo = {
  nics      : Array<HostNicInfo>,
  vswitches : Array<VirtualSwitchInfo>
}

type HostNicInfo = {
  name      : string,
  speed     : number,
  mtu       : number,
  linkup    : boolean,
  device    : string,
  port      : string,
  driver    : string
}

type VirtualSwitchInfo = {
  name      : string,
  uplinks   : Array<string>,
  mtu       : number,
  portgroups: Array<PortgroupInfo>

}

type PortgroupInfo = {
  name      : string,
  vlan      : number
}

type HostStorageInfo = {
  hbas      : Array<HostHbaInfo>,
  disks     : Array<HostDiskInfo>
}

type HostHbaInfo = {
  name      : string,
  device    : string,
  port      : string,
  driver    : string
}

type HostDiskInfo = {
  name      : string,
  size      : number,
  adapters  : Array<string>
}

type HostPackageInfo = {
  name      : string,
  version   : string
}
