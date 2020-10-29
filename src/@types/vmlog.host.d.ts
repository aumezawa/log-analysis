type HostInfo = {
  hostname  : string,
  version   : string,
  build     : string,
  system    : HostSystemInfo,
  hardware  : HostHardwareInfo,
  network   : HostNetworkInfo,
  storage   : HostStorageInfo,
  packages  : Array<HostPackageInfo>
}

type HostSystemInfo = {
  powerPolicy                 : string,
  pcipDisablePciErrReporting  : string,
  enableACPIPCIeHotplug       : string
}

type HostHardwareInfo = {
  machine   : string,
  serial    : string,
  cpu       : HostCpuInfo,
  memory    : number,
  cards     : Array<HostPciCardInfo>
}

type HostCpuInfo = {
  model     : string,
  sockets   : number,
  cores     : number,
  threads   : number
}

type HostPciCardInfo = {
  slot      : number,
  device    : string,
  sbdf      : string
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
  sbdf      : string,
  device    : string,
  port      : string,
  mac       : string,
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
  sbdf      : string,
  device    : string,
  port      : string,
  wwn       : string,
  driver    : string
}

type HostDiskInfo = {
  name      : string,
  vml       : string,
  storage   : string,
  size      : number,
  adapters  : Array<string>,
  nmp_psp   : string,
  nmp_satp  : string
}

type HostPackageInfo = {
  name      : string,
  version   : string
}
