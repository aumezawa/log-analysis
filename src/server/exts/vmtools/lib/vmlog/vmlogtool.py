#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = ['DecompressBundle', 'GetHostList', 'GetHostInfo', 'GetVmList', 'GetVmInfo']
__author__  = 'aume'
__version   = '0.0.0'


################################################################################
### Required Modules
################################################################################
import gzip
import logging
import os
import re
import shutil
import stat
import sys
import tarfile
import xml.etree.ElementTree as et


################################################################################
### Error Codes
################################################################################
RET_NORMAL_END  =  0
RET_SYS_ERROR   = -1


################################################################################
### Setup Logger
################################################################################
try:
    logger = logging.getLogger('vmtools')
except Exception as e:
    print(e)
    sys.exit(RET_SYS_ERROR)


################################################################################
### External Functions - Decompress
################################################################################
def DecompressBundle(filePath, compressLargeFiles=False, preserveOriginalFile=False):
    dirPath = ExtractFiles(filePath)
    MargeFragmentFiles(os.path.join(dirPath, 'commands'))
    MargeCompressedFragmentFiles(os.path.join(dirPath, 'var', 'run', 'log'))
    CleanupFile(os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt'), r"^ResourceGroup:.*$")
    if compressLargeFiles:
        CompressLargeFiles(os.path.join(dirPath, 'commands'))
        CompressLargeFiles(os.path.join(dirPath, 'var', 'run', 'log'))
    if not preserveOriginalFile:
        os.remove(filePath)
    return dirPath


################################################################################
### External Functions - Get ESXi Information
################################################################################
def GetHostList(dirPath):
    return [GetHostName(dirPath)]


def GetHostInfo(dirPath, esxName):
    if esxName != GetHostName(dirPath):
        return None
    #
    try:
        return {
            'hostname'      : GetHostName(dirPath),
            'version'       : GetEsxiVersion(dirPath),
            'build'         : GetEsxiBuildNumber(dirPath),
            'hardware'  : {
                'machine'   : GetMachineModel(dirPath),
                'cpu'       : GetCpuInfo(dirPath),
                'memory'    : GetMemory(dirPath),
                'cards'     : GetPciCards(dirPath)
            },
            'network'   : {
                'nics'      : GetNics(dirPath),
                'vswitches' : GetVswitches(dirPath),
            },
            'storage'   : {
                'hbas'      : GetHbas(dirPath),
                'disks'     : GetDisks(dirPath)
            },
            'packages'      : GetPackages(dirPath)
        }
    except Exception as e:
        logger.error(e)
        return None


################################################################################
### External Functions - Get VM Information
################################################################################
def GetVmList(dirPath):
    filePath = os.path.join(dirPath, 'etc', 'vmware', 'hostd', 'vmInventory.xml')
    xpath    = r"./ConfigEntry/vmxCfgPath"
    vmList = []
    for vmxFile in SearchInXml(filePath, xpath, multi=True, default=[]):
        vmList.append(os.path.splitext(os.path.basename(vmxFile))[0])
    vmList.sort()
    return vmList


def GetVmInfo(dirPath, vmName):
    vmxFile = GetVmxPath(dirPath, vmName)
    if not vmxFile:
        return None
    vmxPath = os.path.join(dirPath, vmxFile)
    vmxDict = GetVmxDict(vmxPath)
    try:
        return {
            'name'      : vmName,
            'version'   : int(vmxDict['virtualHW.version']),
            'cpus'      : int(vmxDict['numvcpus']),
            'memory'    : int(vmxDict['memSize']) // 1024,
            'guest'     : vmxDict['guestOS'],
            'state'     : GetVmStatus(dirPath, vmName),
            'nics'      : GetVmNics(vmxDict),
            'disks'     : GetVmDisks(vmxDict),
            'dpios'     : GetDpios(vmxDict),
            'vfs'       : GetVmSriovVfs(vmxDict)
        }
    except Exception as e:
        logger.error(e)
        return None


################################################################################
### Internal Functions - Decompress
################################################################################
def ExtractFiles(filePath, override=True, rmRetry=5):
    dirPath = os.path.dirname(filePath)
    try:
        tarFile = tarfile.open(filePath, 'r')
        extPath = os.path.join(dirPath, tarFile.getnames()[0].split('/')[0])
        tarFile.close()
    except Exception as e:
        logger.error(e)
        return None
    #
    if os.path.exists(extPath):
        if override:
            while rmRetry:
                try:
                    shutil.rmtree(extPath, onerror=_RemoveReadonlyFileOnWin)
                    break
                except Exception as e:
                    logger.debug(e)
                    rmRetry = rmRetry - 1
            if not rmRetry:
                logger.error('%s could be not removed.' % (extPath))
                return None
        else:
            return extPath
    #
    try:
        tarFile = tarfile.open(filePath, 'r')
        tarFile.extractall(path=dirPath)
        tarFile.close()
    except Exception as e:
        logger.error(e)
        return None
    return extPath


def MargeFragmentFiles(dirPath, suffix=r"[.]FRAG-[0-9]{5}"):
    repattern = re.compile(r"^(.+)%s$" % suffix)
    targets = {}
    try:
        for filename in os.listdir(dirPath):
            match = repattern.match(filename)
            if match:
                orgFileName = match.groups()[0]
                if not orgFileName in targets:
                    targets[orgFileName] = []
                targets[orgFileName].append(filename)
    except Exception as e:
        logger.error(e)
        return False
    #
    for orgFileName in targets.keys():
        targets[orgFileName].sort()
        try:
            orgFilePath = os.path.join(dirPath, orgFileName)
            with open(orgFilePath, 'wb') as fpOrg:
                for fragFileName in targets[orgFileName]:
                    fragFilePath = os.path.join(dirPath, fragFileName)
                    with open(fragFilePath, 'rb') as fpFrag:
                        fpOrg.write(fpFrag.read())
                    os.remove(fragFilePath)
        except Exception as e:
            logger.error(e)
            return False
    #
    return True


def MargeCompressedFragmentFiles(dirPath, suffix=r"[.][0-9][.]gz"):
    repattern = re.compile(r"^(.+)%s$" % suffix)
    targets = {}
    try:
        for filename in os.listdir(dirPath):
            match = repattern.match(filename)
            if match:
                orgFileName = match.groups()[0] + '.log'
                if not orgFileName in targets:
                    targets[orgFileName] = []
                targets[orgFileName].append(filename)
    except Exception as e:
        logger.error(e)
        return False
    #
    for orgFileName in targets.keys():
        targets[orgFileName].sort(reverse=True)
        try:
            orgFilePath = os.path.join(dirPath, orgFileName)
            tmpFilePath = os.path.join(dirPath, orgFileName + '.tmp')
            with open(tmpFilePath, 'wb') as fpTmp:
                for fragFileName in targets[orgFileName]:
                    fragFilePath = os.path.join(dirPath, fragFileName)
                    with gzip.open(fragFilePath, 'rb') as fpFrag:
                        fpTmp.write(fpFrag.read())
                    os.remove(fragFilePath)
                with open(orgFilePath, 'rb') as fpOrg:
                    fpTmp.write(fpOrg.read())
                os.remove(orgFilePath)
            os.rename(tmpFilePath, orgFilePath)
        except Exception as e:
            logger.error(e)
            return False
    #
    return True


def CleanupFile(filePath, deleteWord):
    orgFilePath = filePath
    tmpFilePath = filePath + '.tmp'
    repattern = re.compile(deleteWord)
    try:
        with open(tmpFilePath, 'w') as fpTmp:
            with open(orgFilePath, 'r') as fpOrg:
                for line in fpOrg:
                    match = repattern.match(line)
                    if not match:
                        fpTmp.write(line)
        os.remove(orgFilePath)
        os.rename(tmpFilePath, orgFilePath)
    except Exception as e:
        if os.path.exists(tmpFilePath) and os.path.exists(orgFilePath):
            os.remove(tmpFilePath)
        logger.error(e)
        return False
    return True


def CompressLargeFiles(dirPath, threshold=10485760):
    try:
        for filename in os.listdir(dirPath):
            orgFilePath = os.path.join(dirPath, filename)
            zipFilePath = os.path.join(dirPath, filename + '.gz')
            if os.path.getsize(orgFilePath) > threshold:
                with gzip.open(zipFilePath, 'wb') as fpZip:
                    with open(orgFilePath, 'rb') as fpOrg:
                        fpZip.write(fpOrg.read())
                os.remove(orgFilePath)
    except Exception as e:
        logger.error(e)
        return False
    #
    return True


def _RemoveReadonlyFileOnWin(func, path, _):
    if not os.access(path, os.W_OK):
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        raise
    return


################################################################################
### Internal Functions - Get Information
################################################################################
def SearchInText(filePath, keyword, default=None):
    repattern = re.compile(keyword)
    try:
        with open(filePath, 'r') as fp:
            for line in fp:
                match = repattern.match(line)
                if match:
                    return match.groups()[0]
    except Exception as e:
        logger.error(e)
        return default
    return default


XmlCache = {}
def SearchInXml(filePath, xpath, multi=False, default=None):
    global XmlCache
    if filePath in XmlCache:
        root = XmlCache[filePath]
    else:
        try:
            with open(filePath, 'r') as fp:
                xmlData = fp.read()
            root = et.fromstring(xmlData)
            XmlCache[filePath] = root
        except Exception as e:
            logger.error(e)
            return default
    #
    if multi:
        nodes = root.findall(xpath)
        txtList = []
        for node in nodes:
            txtList.append(node.text)
        txtList.sort()
        return txtList
    else:
        node = root.find(xpath)
        if node is not None:
            return node.text
    return default


def GetXmlNode(filePath, xpath, multi=False):
    global XmlCache
    if filePath in XmlCache:
        root = XmlCache[filePath]
    else:
        try:
            with open(filePath, 'r') as fp:
                xmlData = fp.read()
            root = et.fromstring(xmlData)
            XmlCache[filePath] = root
        except Exception as e:
            logger.error(e)
            return None
    #
    if multi:
        return root.findall(xpath)
    else:
        return root.find(xpath)


################################################################################
### Internal Functions - Get Host Information
################################################################################
def _int(val, base=10, default=None, calc=None):
    if (val is None) or (not isinstance(val, str)):
        return default
    if calc is None:
        return int(val, base)
    else:
        return calc(int(val, base))


def GetEsxiVersion(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'uname_-a.txt')
    keyword  = r"^.*([0-9][.][0-9][.][0-9]).*$"
    return SearchInText(filePath, keyword)


def GetEsxiBuildNumber(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'uname_-a.txt')
    keyword  = r"^.*build-([0-9]+).*$"
    return SearchInText(filePath, keyword)


def GetHostName(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'uname_-a.txt')
    keyword  = r"^VMkernel[ ](\S+)[ ].*$"
    return SearchInText(filePath, keyword)


def GetMachineModel(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/value[@name="product-name"]'
    return SearchInXml(filePath, xpath)


def GetCpuInfo(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    return {
        'sockets'   : _int(SearchInXml(filePath, './hardware-info/cpu-info/value[@name="num-packages"]')),
        'cores'     : _int(SearchInXml(filePath, './hardware-info/cpu-info/value[@name="num-cores"]'))
    }


def GetMemory(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/memory-info/value[@name="physical-mem"]'
    memory   = SearchInXml(filePath, xpath)
    return _int(memory, calc=lambda x: x // 1024 // 1024 // 1024 + 1)


def GetPciCards(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/pci-info/all-pci-devices/pci-device'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    cards = []
    for node in nodes:
        func = _int(node.findtext('./value[@name="function"]'), base=16)
        slot = _int(node.findtext('./value[@name="physical-slot"]'))
        if (func == 0) and (slot <= 16):
            cards.append({
                'slot'  : slot,
                'device': node.findtext('./value[@name="device-name"]')
            })
    cards.sort(key=lambda x: x['slot'])
    return cards


def GetNics(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './network-info/physical-nics/physical-nic'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    nics = []
    for node in nodes:
        slot = node.findtext('./pci-device/value[@name="slot-description"]', default='Unknown')
        port = node.findtext('./pci-device/value[@name="function"]')
        nics.append({
            'name'      : node.findtext('./value[@name="name"]'),
            'speed'     : _int(node.findtext('./value[@name="actual-speed"]')),
            'linkup'    : node.findtext('./value[@name="link-up"]') == 'true',
            'mtu'       : _int(node.findtext('./value[@name="mtu"]')),
            'device'    : node.findtext('./pci-device/value[@name="device-name"]'),
            'port'      : 'Device %s, Port %s' % (slot, str(_int(port, base=16, default='Unknown'))),
            'driver'    : node.findtext('./value[@name="driver"]')
        })
    nics.sort(key=lambda x: x['name'])
    return nics


def GetVswitches(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './network-info/virtual-switch-info/virtual-switches/virtual-switch'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    switches = []
    for node in nodes:
        portgroups  = []
        for child in node.findall('./port-groups/port-group'):
            portgroups.append({
                'name'  : child.findtext('./value[@name="name"]'),
                'vlan'  : _int(child.findtext('./value[@name="vlan-id"]'))
            })
            portgroups.sort(key=lambda x: x['name'])
        switches.append({
            'name'      : node.findtext('./value[@name="name"]'),
            'uplinks'   : sorted(node.findtext('./value[@name="uplinks"]', default='').split(',')),
            'mtu'       : _int(node.findtext('./value[@name="mtu"]')),
            'portgroups': portgroups
        })
    switches.sort(key=lambda x: x['name'])
    return switches


def GetHbas(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './storage-info/all-scsi-iface/fibrechannel-scsi-interface/scsi-interface'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    hbas = []
    for node in nodes:
        slot = node.findtext('./pci-device/value[@name="slot-description"]', default='Unknown')
        port = node.findtext('./pci-device/value[@name="function"]')
        hbas.append({
            'name'      : node.findtext('./value[@name="name"]'),
            'device'    : node.findtext('./pci-device/value[@name="device-name"]'),
            'port'      : 'Device %s, Port %s' % (slot, str(_int(port, base=16, default='Unknown'))),
            'driver'    : node.findtext('./value[@name="driver"]')
        })
    hbas.sort(key=lambda x: x['name'])
    return hbas


def GetDisks(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './storage-info/all-scsi-iface/fibrechannel-scsi-interface/scsi-interface/paths/scsi-path'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    disks = []
    for node in nodes:
        name    = node.findtext('./value[@name="device-identifier"]')
        adapter = node.findtext('./value[@name="adapter-name"]')
        for disk in disks:
            if name == disk['name']:
                disk['adapters'].append(adapter)
                disk['adapters'].sort()
                break
        else:
            disks.append({
                'name'      : name,
                'size'      : _int(node.findtext('./disk-lun/value[@name="size"]'), calc=lambda x: x // 1024 // 1024 // 1024),
                'adapters'  : [adapter]
            })
    disks.sort(key=lambda x: x['name'])
    return disks


def GetPackages(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'localcli_software-vib-list.txt')
    repattern = re.compile(r"^(\S+)[ ]+(\S+)[ ].*$")
    packages = []
    try:
        with open(filePath, 'r') as fp:
            title = True
            for line in fp:
                if title:
                    title = False
                    continue
                match = repattern.match(line)
                if match:
                    packages.append({
                        'name'      : match.groups()[0],
                        'version'   : match.groups()[1]
                    })
    except Exception as e:
        logger.error(e)
        return None
    packages.sort(key=lambda x: x['name'])
    return packages


################################################################################
### Internal Functions - Get VM Information
################################################################################
def GetVmxPath(dirPath, vmName):
    filePath = os.path.join(dirPath, 'etc', 'vmware', 'hostd', 'vmInventory.xml')
    xpath    = './ConfigEntry/vmxCfgPath'
    for vmxFile in SearchInXml(filePath, xpath, multi=True, default=[]):
        if vmName in vmxFile:
            return vmxFile[1:]  # Note: removed leading character '/'
    return None


VmxDictCache = {}
def GetVmxDict(vmxPath):
    global VmxDictCache
    if vmxPath in VmxDictCache:
        return VmxDictCache[vmxPath]
    #
    repattern = re.compile(r'(.+) = "(.+)"')
    vmxDict = {}
    try:
        with open(vmxPath, 'r') as fp:
            for line in fp:
                match = repattern.match(line)
                if match:
                    vmxDict[match.groups()[0]] = match.groups()[1]
    except Exception as e:
        logger.error(e)
        return None
    #
    return vmxDict


def GetVmStatus(dirPath, vmName):
    filePath = os.path.join(dirPath, 'commands', 'localcli_vm-process-list.txt')
    repattern = re.compile(r"^%s:$" % vmName)
    try:
        with open(filePath, 'r') as fp:
            for line in fp:
                match = repattern.match(line)
                if match:
                    return 'on'
    except Exception as e:
        logger.error(e)
        return None
    return 'off'


def GetVmNics(vmxDict):
    repattern = re.compile(r"^(ethernet[0-9]+)[.]present$")
    vmNics = []
    for key in vmxDict.keys():
        match = repattern.match(key)
        if match:
            ethernet = match.groups()[0]
            vmNics.append({
                'name'      : ethernet,
                'device'    : vmxDict[ethernet + '.virtualDev'],
                'portgroup' : vmxDict[ethernet + '.networkName'],
                'present'   : vmxDict[ethernet + '.present'] == 'TRUE',
                'slot'      : int(vmxDict[ethernet + '.pciSlotNumber']),
                'mac'       : vmxDict[ethernet + '.generatedAddress']
            })
    vmNics.sort(key=lambda x: x['name'])
    return vmNics


def GetVmDisks(vmxDict):
    repattern = re.compile(r"^(scsi[0-9]+:[0-9]+)[.]present$")
    vmDisks = []
    for key in vmxDict.keys():
        match = repattern.match(key)
        if match:
            scsi = match.groups()[0]
            vmDisks.append({
                'name'      : scsi,
                'device'    : vmxDict[scsi + '.deviceType'],
                'mode'      : vmxDict[scsi + '.mode'] if (scsi + '.mode' in vmxDict) else None,
                'present'   : vmxDict[scsi + '.present'] == 'TRUE'
            })
    vmDisks.sort(key=lambda x: x['name'])
    return vmDisks


def GetDpios(vmxDict):
    repattern = re.compile(r"^(pciPassthru[0-9]+)[.]id$")
    Dpios = []
    for key in vmxDict.keys():
        match = repattern.match(key)
        if match and (match.groups()[0] + '.pfId') not in vmxDict:
            pciPassthru = match.groups()[0]
            Dpios.append({
                'name'      : pciPassthru,
                'id'        : vmxDict[pciPassthru + '.id'],
                'present'   : vmxDict[pciPassthru + '.present'] == 'TRUE',
                'slot'      : int(vmxDict[pciPassthru + '.pciSlotNumber'])
            })
    Dpios.sort(key=lambda x: x['slot'])
    return Dpios


def GetVmSriovVfs(vmxDict):
    repattern = re.compile(r"^(pciPassthru[0-9]+)[.]pfId$")
    vmSriovVfs = []
    for key in vmxDict.keys():
        match = repattern.match(key)
        if match:
            pciPassthru = match.groups()[0]
            vmSriovVfs.append({
                'name'      : pciPassthru,
                'id'        : vmxDict[pciPassthru + '.id'],
                'pfid'      : vmxDict[pciPassthru + '.pfId'],
                'portgroup' : vmxDict[pciPassthru + '.networkName'],
                'present'   : vmxDict[pciPassthru + '.present'] == 'TRUE',
                'slot'      : int(vmxDict[pciPassthru + '.pciSlotNumber']),
                'mac'       : vmxDict[pciPassthru + '.generatedMACAddress']
            })
    vmSriovVfs.sort(key=lambda x: x['slot'])
    return vmSriovVfs
