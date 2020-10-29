type VmInfo = {
  name      : string,
  version   : string,
  cpus      : number,
  memory    : number,
  firmware  : string,
  guest     : string,
  state     : string,
  options   : VmOptionInfo,
  nics      : Array<VirtualNicInfo>,
  scsis     : Array<VirtualScsiInfo>,
  disks     : Array<VirtualDiskInfo>,
  dpios     : Array<PassthruDeviceInfo>,
  vfs       : Array<VfNicInfo>
}

type VmOptionInfo = {
  uefi_secureBoot_enabled                   : string,
  cpuid_coresPerSocket                      : string,
  numa_nodeAffinity                         : string,
  numa_vcpu_maxPerMachineNode               : string,
  numa_vcpu_maxPerVirtualNode               : string,
  numa_autosize                             : string,
  sched_cpu_affinity                        : string,
  sched_cpu_latencySensitivity              : string,
  sched_cpu_min                             : string,
  latency_enforceCpuMin                     : string,
  timeTracker_apparentTimeIgnoresInterrupts : string
}

type VirtualNicInfo = {
  name      : string,
  device    : string,
  present   : boolean,
  slot      : number,
  mac       : string,
  portgroup : string
}

type VirtualScsiInfo = {
  name      : string,
  device    : string,
  present   : boolean,
  slot      : number
}

type VirtualDiskInfo = {
  name      : string,
  device    : string,
  size      : number,
  present   : boolean,
  mode      : string,
  pdisk     : string
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
