type HostInfo = {
  format    : string,
  hostname  : string,
  version   : string,
  build     : string,
  profile   : string,
  uptime    : number,
  system    : HostSystemInfo,
  log       : HostLogInfo,
  date      : HostDateInfo,
  hardware  : HostHardwareInfo,
  network   : HostNetworkInfo,
  storage   : HostStorageInfo,
  packages  : Array<HostPackageInfo>
}

type HostSystemInfo = {
  powerPolicy                 : string,
  scratchPartition            : string,
  coreDumpPartition           : string,
  nmiAction                   : number,
  hardwareAcceleratedInit     : number,
  hardwareAcceleratedMove     : number,
  pcipDisablePciErrReporting  : string,
  enableACPIPCIeHotplug       : string
}

type HostLogInfo = {
  server    : string,
  config    : Array<HostLogConfigInfo>
}

type HostLogConfigInfo = {
  name      : string,
  level     : string,
  size      : number,
  rotate    : number
}

type HostDateInfo = {
  ntp       : Array<HostNtpStatusInfo>
}

type HostNtpStatusInfo = {
  remote    : string,
  status    : string
}

type HostHardwareInfo = {
  machine   : string,
  serial    : string,
  bios      : string,
  bmc       : string,
  cpu       : HostCpuInfo,
  memory    : number,
  numa      : number,
  cards     : Array<HostPciCardInfo>
}

type HostCpuInfo = {
  model     : string,
  sockets   : number,
  cores     : number,
  htEnable  : boolean
}

type HostPciCardInfo = {
  slot      : number,
  device    : string,
  sbdf      : string
}

type HostNetworkInfo = {
  nics      : Array<HostNicInfo>,
  vswitches : Array<VirtualSwitchInfo>,
  portgroups: Array<PortgroupInfo>,
  vmknics   : Array<VMKernelNicInfo>
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
  balance   : string,
  detection : string,
  failback  : boolean
}

type PortgroupInfo = {
  name      : string,
  vswitch   : string,
  vlan      : number
}

type VMKernelNicInfo = {
  name      : string,
  ip        : string,
  portgroup : string,
  mtu       : number,
  mac       : string
}

type HostStorageInfo = {
  hbas      : Array<HostHbaInfo>,
  disks     : Array<HostDiskInfo>,
  devices   : Array<HostDeviceInfo>
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
  nmp_satp  : string,
  bootbank  : boolean,
  vmfsName  : string,
  vmfsPath  : string
}

type HostDeviceInfo = {
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
