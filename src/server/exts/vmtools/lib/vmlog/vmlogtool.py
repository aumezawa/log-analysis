#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = ['DecompressBundle', 'GetHostList', 'GetHostInfo', 'GetVmList', 'GetVmInfo', 'GetVmLogPath', 'GetVCenterList', 'GetVCenterInfo', 'GetZdumpList' 'GetZdumpInfo']
__author__  = 'aumezawa'
__version__ = '0.1.13'


################################################################################
### Required Modules
################################################################################
from datetime import datetime as dt
import gzip
import json
import logging
import os
import re
import shutil
import stat
import sys
import tarfile
import time
import xml.etree.ElementTree as et
import zipfile


################################################################################
### Error Codes
################################################################################
RET_NORMAL_END  =  0
RET_SYS_ERROR   = -1


################################################################################
### Setup Logger
################################################################################
try:
    logger = logging.getLogger('file')
except Exception as e:
    print(e)
    sys.exit(RET_SYS_ERROR)


################################################################################
### External Functions - Decompress
################################################################################
def DecompressBundle(filePath, compressLargeFiles=False, preserveOriginalFile=False):
    if filePath.endswith('.zip'):
        if not UnzippableVCenterBundle(filePath):
            os.remove(filePath)
            return None
        #
        fileList = UnzipFiles(filePath)
        if fileList is None:
            os.remove(filePath)
            return None
        fileList.sort()
        #
        os.remove(filePath)
        #
        infoList = []
        for unzippedFile in fileList:
            info = DecompressBundle(unzippedFile, compressLargeFiles=compressLargeFiles, preserveOriginalFile=preserveOriginalFile)
            if info is not None:
                infoList.append(info[0])
        return infoList
    elif filePath.endswith('.tgz'):
        dirPath = ExtractFiles(filePath)
        if dirPath is None:
            os.remove(filePath)
            return None
        #
        logType = GetLogBundleType(dirPath)
        if logType == 'vm-support':
            MargeFragmentFiles(os.path.join(dirPath, 'commands'))
            MargeFragmentFiles(os.path.join(dirPath, 'var', 'core'))
            MargeFragmentFiles(os.path.join(dirPath, 'var', 'log'))
            MargeCompressedFragmentFiles(os.path.join(dirPath, 'var', 'run', 'log'))
            CleanupFile(os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt'), r"^ResourceGroup:.*$")
            #MargeVmwareLogFiles(dirPath)
            if compressLargeFiles:
                CompressLargeFiles(os.path.join(dirPath, 'commands'))
                CompressLargeFiles(os.path.join(dirPath, 'var', 'run', 'log'))
        elif logType == 'vc-support':
            MargeFragmentFiles(os.path.join(dirPath, 'commands'))
        #
        logTime = GetLogBundleTime(filePath)
        #
        if preserveOriginalFile:
            os.rename(filePath, dirPath + '.tgz')
        else:
            os.remove(filePath)
        #
        SetFilePermission(dirPath)
        return [ {
            'name'          : os.path.basename(dirPath),
            'directory'     : os.path.dirname(dirPath),
            'path'          : dirPath,
            'isDirectory'   : True,
            'children'      : None,
            'type'          : logType,
            'size'          : None,
            'mtime'         : logTime
        } ]
    else:
        os.remove(filePath)
        return None


################################################################################
### External Functions - Get ESXi Information
################################################################################
def GetHostList(dirPath):
    if GetLogBundleType(dirPath) != "vm-support":
        logger.debug('Unsupported bundle type...')
        return []
    #
    return [GetHostName(dirPath)]


def GetHostInfo(dirPath, esxName):
    if GetLogBundleType(dirPath) != "vm-support":
        logger.debug('Unsupported bundle type...')
        return None
    if esxName != GetHostName(dirPath):
        logger.debug('Unknown hostname...')
        return None
    #
    try:
        return {
            'format'        : __version__,
            'hostname'      : GetHostName(dirPath),
            'version'       : GetEsxiVersion(dirPath),
            'build'         : GetEsxiBuildNumber(dirPath),
            'profile'       : GetHostProfile(dirPath),
            'state'         : GetHostState(dirPath),
            'system'        : GetEsxiSystem(dirPath),
            'log'           : GetLogConfig(dirPath),
            'date'          : GetDateStatus(dirPath),
            'hardware'  : {
                'machine'   : GetMachineModel(dirPath),
                'serial'    : GetMachineSerialNumber(dirPath),
                'bios'      : GetBiosVersion(dirPath),
                'bmc'       : GetBmcVersion(dirPath),
                'cpu'       : GetCpuInfo(dirPath),
                'memory'    : GetMemory(dirPath),
                'numa'      : GetNumOfNumaNodes(dirPath),
                'cards'     : GetPciCards(dirPath)
            },
            'network'   : {
                'nics'      : GetNics(dirPath),
                'vswitches' : GetVswitches(dirPath),
                'portgroups': GetPortgroups(dirPath),
                'vmknics'   : GetVMKernelNics(dirPath)
            },
            'storage'   : {
                'hbas'      : GetHbas(dirPath),
                'disks'     : GetDisks(dirPath),
                'devices'   : GetScsiDevices(dirPath)
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
    vmsdPath = vmxPath.replace('.vmx', '.vmsd')
    vmsdDict = GetVmxDict(vmsdPath)
    try:
        return {
            'format'    : __version__,
            'name'      : vmName,
            'version'   : int(vmxDict['virtualHW.version']),
            'cpus'      : int(GetVmxValue(vmxDict, 'numvcpus', default='1')),
            'memory'    : int(vmxDict['memSize']) // 1024,
            'firmware'  : GetVmxValue(vmxDict, 'firmware', default='bios'),
            'guest'     : vmxDict['guestOS'],
            'options'   : GetVmOptions(vmxDict),
            'state'     : GetVmStatus(dirPath, vmName),
            'snapshot'  : GetVmSnapshot(vmsdDict),
            'nics'      : GetVmNics(vmxDict),
            'scsis'     : GetVmScsis(vmxDict),
            'disks'     : GetVmDisks(vmxPath, vmxDict),
            'dpios'     : GetDpios(vmxDict),
            'vfs'       : GetVmSriovVfs(vmxDict)
        }
    except Exception as e:
        logger.error(e)
        return None


def GetVmLogPath(dirPath, vmName):
    vmxFile = GetVmxPath(dirPath, vmName)
    if not vmxFile:
        return None
    vmLogPath = os.path.dirname(vmxFile) + '/' + 'vmware.log'
    return vmLogPath


################################################################################
### External Functions - Get vCenter Server Information
################################################################################
def GetVCenterList(dirPath):
    if GetLogBundleType(dirPath) != "vc-support":
        logger.debug('Unsupported bundle type...')
        return None
    #
    return [GetVCenterName(dirPath)]


def GetVCenterInfo(dirPath, vcName):
    if GetLogBundleType(dirPath) != "vc-support":
        logger.debug('Unsupported bundle type...')
        return None
    #
    if vcName != GetVCenterName(dirPath):
        return None
    try:
        return {
            'format'        : __version__,
            'vcname'        : GetVCenterName(dirPath),
            'version'       : GetVCenterVersion(dirPath),
            'build'         : GetVCenterBuild(dirPath),
            'uptime'        : GetVCenterUptime(dirPath),
            'vsan'          : GetVSanInfo(dirPath)
        }
    except Exception as e:
        logger.error(e)
        return None


################################################################################
### External Functions - Get Zdump Information
################################################################################
def GetZdumpList(dirPath):
    dirPath = os.path.join(dirPath, 'var', 'core')
    zdumpList = []
    repattern = re.compile(r"^vmkernel-zdump[.][0-9]+$")
    if os.path.exists(dirPath):
        for filename in os.listdir(dirPath):
            match = repattern.match(filename)
            if match:
                zdumpList.append(filename)
    zdumpList.sort()
    return zdumpList


def GetZdumpInfo(dirPath, zdumpName):
    filePath = os.path.join(dirPath, 'var', 'core', zdumpName)
    if os.path.exists(filePath):
        build       = None
        panic_date  = None
        panic_msg   = None
        uptime      = None
        trace       = []
        log         = []
        #
        reBuild = re.compile(r"^.*(build-[0-9]+)\s.*$")
        reLog = re.compile(r"^([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*)$")
        rePanic = re.compile(r"^([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}).*@BlueScreen: (.*)$")
        reUptime = re.compile(r"^.*VMK uptime: ([0-9:.]+)$")
        reTrace = re.compile(r"^.*(0x[0-9a-f]+:\[0x[0-9a-f]+\].*)$")
        reEnd = re.compile(r"^.*Coredump to disk.*$")
        #
        logFlag = True
        traceFlag = False
        with open(filePath, 'r') as fp:
            for line in fp:
                match = reBuild.match(line)
                if match:
                    build = match.groups()[0]
                #
                if logFlag:
                    match = reLog.match(line)
                    if match:
                        log.append(match.groups()[0])
                #
                match = rePanic.match(line)
                if match:
                    panic_date = match.groups()[0]
                    panic_msg = match.groups()[1]
                    logFlag = False
                    traceFlag = True
                #
                if traceFlag:
                    match = reUptime.match(line)
                    if match:
                        uptime = match.groups()[0]
                    #
                    match = reTrace.match(line)
                    if match:
                        trace.append(match.groups()[0])
                #
                match = reEnd.match(line)
                if match:
                    break
        #
        # for latest 3 days
        pd = dt.strptime(panic_date, '%Y-%m-%dT%H:%M:%S')
        count = 0
        for line in log:
            if (pd - dt.strptime(line[:19], '%Y-%m-%dT%H:%M:%S')).days <= 2:
                break
            count = count + 1
        log = log[count:]
        #
        return {
            'build'     : build,
            'panic_date': panic_date,
            'panic_msg' : panic_msg,
            'uptime'    : uptime,
            'trace'     : trace,
            'log'       : log
        }
    else:
        return None


################################################################################
### Internal Functions - Decompress
################################################################################
def UnzippableVCenterBundle(filePath):
    try:
        with zipfile.ZipFile(filePath) as zfile:
            fileList = zfile.namelist()
            for fileName in fileList:
                if not fileName.endswith('.tgz'):
                    return False
    except Exception as e:
        logger.error(e)
        return False
    return True


def UnzipFiles(filePath):
    dirPath = os.path.dirname(filePath)
    try:
        with zipfile.ZipFile(filePath) as zfile:
            fileList = zfile.namelist()
            zfile.extractall(dirPath)
    except Exception as e:
        logger.error(e)
        return None
    return list(map(lambda file: os.path.join(dirPath, file), fileList))


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
            if not RemoveDirectory(extPath, rmRetry=rmRetry):
                return None
        else:
            return extPath
    #
    try:
        tarFile = tarfile.open(filePath, 'r')
        for tarInfo in tarFile.getmembers():
            if ':' in tarInfo.name:
                tarInfo.name = tarInfo.name.replace(':', '_')
        tarFile.extractall(path=dirPath)
        tarFile.close()
    except Exception as e:
        logger.error(e)
        RemoveDirectory(extPath, rmRetry=rmRetry)
        return None
    return extPath


def GetLogBundleTime(filePath):
    try:
        tarFile = tarfile.open(filePath, 'r')
        logTime = dt.fromtimestamp(tarFile.getmembers()[0].mtime + time.timezone).isoformat() + 'Z'
        tarFile.close()
    except Exception as e:
        logger.error(e)
        return None
    #
    return logTime


def GetLogBundleType(dirPath):
    vmFilePath = os.path.join(dirPath, 'etc', 'vmware', 'vm-support')
    vcFilePath = os.path.join(dirPath, 'usr', 'lib', 'vmware-sca', 'conf', 'vc-support.properties')
    #
    if os.path.exists(vmFilePath):
        return "vm-support"
    elif os.path.exists(vcFilePath):
        return "vc-support"
    else:
        return "unknown"


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


def MargeVmwareLogFiles(dirPath):
    repattern = re.compile(r"^vmware-[0-9]+[.]log$")
    try:
        for vmName in GetVmList(dirPath):
            vmxFile = GetVmxPath(dirPath, vmName)
            vmxPath = os.path.join(dirPath, vmxFile)
            vmDir = os.path.dirname(vmxPath)
            #
            logList = []
            for filename in os.listdir(vmDir):
                match = repattern.match(filename)
                if match:
                    logList.append(os.path.join(vmDir, filename))
            logList.sort(key=lambda x: int(re.search(r"[0-9]+", x).group()))
            #
            orgFile = os.path.join(vmDir, 'vmware.log')
            tmpFile = os.path.join(vmDir, 'vmware-latest.log')
            if os.path.exists(orgFile):
                os.rename(orgFile, tmpFile)
                logList.append(tmpFile)
            #
            with open(orgFile, 'w') as fpOrg:
                for logFile in logList:
                    with open(logFile, 'r') as fpTmp:
                        fpOrg.write(fpTmp.read())
                    os.remove(logFile)
    except Exception as e:
        logger.error(e)
        return False
    #
    return True


def MargeCompressedFragmentFiles(dirPath, suffix=r"[.][0-9]+[.]gz"):
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


def SetFilePermission(node):
    if os.path.isdir(node):
        for subnode in os.listdir(node):
            SetFilePermission(os.path.join(node, subnode))
    elif os.path.isfile(node):
        os.chmod(node, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
        return True
    else:
        return False


def RemoveDirectory(dirPath, rmRetry=5):
    while rmRetry:
        try:
            shutil.rmtree(dirPath, onerror=_RemoveReadonlyFileOnWin)
            break
        except Exception as e:
            logger.debug(e)
            rmRetry = rmRetry - 1
    if not rmRetry:
        logger.error('%s could be not removed.' % (dirPath))
        return False
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
def SearchInText(filePath, keyword, multi=False, default=None):
    list = []
    repattern = re.compile(keyword)
    try:
        with open(filePath, 'r') as fp:
            for line in fp:
                match = repattern.match(line)
                if match:
                    if multi:
                        list.append(match.groups()[0])
                    else:
                        return match.groups()[0]
    except Exception as e:
        logger.error(e)
        return default
    if multi:
        return list
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


VimDictCache = {}
def GetVimDict(filePath, target='HostSystem'):
    global VimDictCache
    if target in VimDictCache:
        return VimDictCache[target]
    #
    repattern_sep = re.compile(r"^=============== [0-9]+. vim.(.+)::\S+ ===============")
    repattern_ext = re.compile(r"\([^()]+\)")
    repattern_st1 = re.compile(r"^(.*)\"(.+)\"(.*)$")
    repattern_st2 = re.compile(r"^(.*)\'(.*)\'(.*)$")
    repattern_st3 = re.compile(r"^\s*(\S+)\s+=\s+(.+)$")
    try:
        with open(filePath, 'r') as fp:
            buffer = ''
            flag = False
            for line in fp:
                if flag:
                    match = repattern_sep.match(line)
                    if match:
                        flag = False
                        break
                    line = line.replace('<unset>', 'null')
                    line = repattern_ext.sub('', line)
                    match = repattern_st1.match(line)
                    if match:
                        line = '%s"%s"%s' % (match.groups()[0], match.groups()[1].replace('\'', ''), match.groups()[2])
                    match = repattern_st2.match(line)
                    if match:
                        line = '%s"%s"%s' % (match.groups()[0], match.groups()[1].replace('\"', '\''), match.groups()[2])
                    match = repattern_st3.match(line)
                    if match:
                        if match.groups()[1][-2:] == '=,' or match.groups()[1][-2:] == 'Z,':
                            line = '"%s": "%s",' % (match.groups()[0], match.groups()[1][0:-1])
                        elif match.groups()[1][-1:] == '=' or match.groups()[1][-1:] == 'Z':
                            line = '"%s": "%s"' % (match.groups()[0], match.groups()[1])
                        else:
                            line = '"%s": %s' % (match.groups()[0], match.groups()[1])
                    buffer = buffer + line
                else:
                    match = repattern_sep.match(line)
                    if match and match.groups()[0] == target:
                        flag = True
                        continue
        dict = json.loads(buffer)[0]
        VimDictCache[target] = dict
    except Exception as e:
        logger.error(e)
        return {}
    return dict


def GetVimDictOption(filePath, param, target='HostSystem', default='Unknown'):
    vimDict  = GetVimDict(filePath, target=target)
    try:
        for prop in vimDict['propSet']:
            if prop['name'] == 'config':
                for option in prop['val']['option']:
                    if option['key'] == param:
                        return option['value']
    except Exception as e:
        logger.error(e)
        return default
    return default


def GetVimDictDpioDevices(filePath, target='HostSystem'):
    vimDict  = GetVimDict(filePath, target=target)
    Dpios = []
    try:
        for prop in vimDict['propSet']:
            if prop['name'] == 'config':
                for info in prop['val']['pciPassthruInfo']:
                    if 'passthruEnabled' in info and info['passthruEnabled'] == True:
                        Dpios.append(info['id'])
    except Exception as e:
        logger.error(e)
        return []
    return Dpios


def GetVimDictSriovDevices(filePath, target='HostSystem'):
    vimDict  = GetVimDict(filePath, target=target)
    Sriov = {}
    try:
        for prop in vimDict['propSet']:
            if prop['name'] == 'config':
                for info in prop['val']['pciPassthruInfo']:
                    if 'sriovEnabled' in info and info['sriovEnabled'] == True and info['id'] == info['dependentDevice']:
                        Sriov[info['id']] = info['numVirtualFunction']
    except Exception as e:
        logger.error(e)
        return {}
    return Sriov


def GetVSanDict(filePath):
    repattern_head = re.compile(r"^.*command>vsan.cluster_info (.+)$")
    repattern_hst1 = re.compile(r"^\s*Host: (.+)$")
    repattern_ver  = re.compile(r"^\s*Product: (.+)$")
    repattern_role = re.compile(r"^\s*Cluster role: (.+)$")
    repattern_evac = re.compile(r"^\s*Node evacuated: (.+)$")
    repattern_net  = re.compile(r"^\s*Adapter: (.+) \((.+)\)$")
    repattern_eff  = re.compile(r"^\s*Data efficiency enabled: (.+)$")
    repattern_enc  = re.compile(r"^\s*Encryption enabled: (.+)$")
    repattern_hst2 = re.compile(r"^\s*Disks on host (.+):$")
    repattern_disk = re.compile(r"^[|]\s+Local VMware Disk \((.+)\)\s+[|]\s+(.+)\s+[|]\s+([0-9.]+) GB\s+[|]\s+(.+)\s+.+$")
    repattern_tbl  = re.compile(r"^[|]\s+(.+)\s+[|]\s+(.+)\s+[|]\s+(.+)\s+[|]\s+[0-9]+\s+[|]\s+[0-9.]+ GB\s+[|]\s+([0-9.]+) %\s+[|]\s+([0-9.]+) %\s+.+$")
    repattern_tail = re.compile(r"^.*command>vsan.check_limits.+$")
    #
    dict = {}
    try:
        with open(filePath, 'r') as fp:
            for line in fp:
                match = repattern_head.match(line)
                if match:
                    dict['name'] = match.groups()[0]
                    dict['nodes'] = []
                    dict['disks'] = []
                    continue
                #
                match = repattern_hst1.match(line)
                if match:
                    hostname = match.groups()[0]
                    dict['nodes'].append({
                        'name'  : hostname
                    })
                    continue
                #
                match = repattern_ver.match(line)
                if match:
                    for host in dict['nodes']:
                        if host['name'] == hostname:
                            host['version'] = match.groups()[0]
                            break
                    continue
                #
                match = repattern_role.match(line)
                if match:
                    for host in dict['nodes']:
                        if host['name'] == hostname:
                            host['role'] = match.groups()[0]
                            break
                    continue
                #
                match = repattern_evac.match(line)
                if match:
                    for host in dict['nodes']:
                        if host['name'] == hostname:
                            host['evacuated'] = True if match.groups()[0] == 'yes' else False
                            break
                    continue
                #
                match = repattern_net.match(line)
                if match:
                    for host in dict['nodes']:
                        if host['name'] == hostname:
                            host['nic'] = match.groups()[0]
                            host['ip']  = match.groups()[1]
                            break
                    continue
                #
                match = repattern_eff.match(line)
                if match:
                    for host in dict['nodes']:
                        if host['name'] == hostname:
                            host['efficiency'] = True if match.groups()[0] == 'yes' else False
                            break
                    continue
                #
                match = repattern_enc.match(line)
                if match:
                    for host in dict['nodes']:
                        if host['name'] == hostname:
                            host['encryption'] = True if match.groups()[0] == 'yes' else False
                            break
                    continue
                #
                match = repattern_hst2.match(line)
                if match:
                    hostname = match.groups()[0]
                    continue
                #
                match = repattern_disk.match(line)
                if match:
                    dict['disks'].append({
                        'path'  : hostname + ':' + match.groups()[0],
                        'type'  : match.groups()[1],
                        'size'  : _int(match.groups()[2]),
                        'state' : match.groups()[3],
                        'tier'  : 'Unknown',
                        'usage' : 0
                    })
                    continue
                #
                match = repattern_tbl.match(line)
                if match:
                    for disk in dict['disks']:
                        if disk['path'] == match.groups()[1] + ':' + match.groups()[0]:
                            disk['tier']  = match.groups()[2]
                            disk['usage'] = float(match.groups()[3])
                            break
                    continue
                match = repattern_tail.match(line)
                if match:
                    break
    except Exception as e:
        logger.error(e)
        return None
    return dict


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


def GetHostProfile(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'localcli_software-profile-get.txt')
    keyword  = r"^\s*Name: (\S+)$"
    return SearchInText(filePath, keyword, default='Unknown')


def GetHostUptime(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'localcli_system-stats-uptime-get.txt')
    keyword  = r"^([0-9]+)$"
    uptime   = SearchInText(filePath, keyword, default=0)
    return _int(uptime, calc=lambda x: x // 1000 // 1000 // 3600 // 24)


def GetHostCpuMemoryUsage(dirPath):
    vmList = GetVmList(dirPath)
    cpu = 0
    mem = 0
    for vmName in vmList:
        vmxFile = GetVmxPath(dirPath, vmName)
        vmxPath = os.path.join(dirPath, vmxFile)
        vmxDict = GetVmxDict(vmxPath)
        if GetVmStatus(dirPath, vmName) == 'on':
            cpu = cpu + int(GetVmxValue(vmxDict, 'numvcpus', default='1'))
            mem = mem + (int(vmxDict['memSize']) // 1024)
    #
    return (cpu * 100 // GetCpuInfo(dirPath)['cores'], mem * 100 // GetMemory(dirPath))


def GetHostName(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'uname_-a.txt')
    keyword  = r"^VMkernel[ ](\S+)[ ].*$"
    return SearchInText(filePath, keyword)


def GetHostState(dirPath):
    (cpu, mem) = GetHostCpuMemoryUsage(dirPath)
    return {
        'uptime'        : GetHostUptime(dirPath),
        'cpu_usage'     : cpu,
        'mem_usage'     : mem
    }


def GetEsxiSystem(dirPath):
    filePath1 = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    #
    filePath2 = os.path.join(dirPath, 'commands', 'localcli_system-settings-kernel-list--d.txt')
    keyword1  = r"^pcipDisablePciErrReporting\s+Bool\s+\S+\s+(TRUE|FALSE)\s+.*$"
    keyword2  = r"^enableACPIPCIeHotplug\s+Bool\s+\S+\s+(TRUE|FALSE)\s+.*$"
    #
    filePath3 = os.path.join(dirPath, 'commands', 'localcli_system-coredump-partition-get.txt')
    keyword3  = r"^.*Active: (.*)$"
    #
    filePath4 = os.path.join(dirPath, 'commands', 'vmware-vimdump_-o----U-dcui.txt')
    return {
        'powerPolicy'               : SearchInXml(filePath1, './hardware-info/cpu-power-management-info/value[@name="current-policy"]'),
        'scratchPartition'          : GetVimDictOption(filePath4, 'ScratchConfig.CurrentScratchLocation'),
        'coreDumpPartition'         : SearchInText(filePath3, keyword3, default='Unknown'),
        'nmiAction'                 : GetVimDictOption(filePath4, 'VMkernel.Boot.nmiAction'),
        'hardwareAcceleratedInit'   : GetVimDictOption(filePath4, 'DataMover.HardwareAcceleratedInit'),
        'hardwareAcceleratedMove'   : GetVimDictOption(filePath4, 'DataMover.HardwareAcceleratedMove'),
        'UseATSForHBOnVMFS5'        : GetVimDictOption(filePath4, 'VMFS3.UseATSForHBOnVMFS5'),
        'pcipDisablePciErrReporting': SearchInText(filePath2, keyword1, default='TRUE'),
        'enableACPIPCIeHotplug'     : SearchInText(filePath2, keyword2, default='FALSE')
    }


def GetLogConfig(dirPath):
    filePath1 = os.path.join(dirPath, 'commands', 'vmware-vimdump_-o----U-dcui.txt')
    #
    filePath2 = os.path.join(dirPath, 'etc', 'vmware', 'vpxa', 'vpxa.cfg')
    filePath3 = os.path.join(dirPath, 'etc', 'vmware', 'fdm', 'fdm.cfg')
    keyword2  = r"^.*<level>(.*)</level>.*$"
    #
    filePath4 = os.path.join(dirPath, 'etc', 'vmsyslog.conf')
    keyword4  = r"^logdir = (.*)$"
    #
    config = [
        {
            'name'      : 'hostd',
            'level'     : GetVimDictOption(filePath1, 'Config.HostAgent.log.level'),
            'size'      : GetVimDictOption(filePath1, 'Syslog.loggers.hostd.size'),
            'rotate'    : GetVimDictOption(filePath1, 'Syslog.loggers.hostd.rotate')
        },
        #{
        #    'name'      : 'fdm',
        #    'level'     : SearchInText(filePath3, keyword2, default='Unknown'),
        #    'size'      : GetVimDictOption(filePath1, 'Syslog.loggers.fdm.size'),
        #    'rotate'    : GetVimDictOption(filePath1, 'Syslog.loggers.fdm.rotate')
        #},
        {
            'name'      : 'vpxa',
            'level'     : SearchInText(filePath2, keyword2, default='Unknown'),
            'size'      : GetVimDictOption(filePath1, 'Syslog.loggers.vpxa.size'),
            'rotate'    : GetVimDictOption(filePath1, 'Syslog.loggers.vpxa.rotate')
        },
        {
            'name'      : 'vmkernel',
            'level'     : 'Unknown',
            'size'      : GetVimDictOption(filePath1, 'Syslog.loggers.vmkernel.size'),
            'rotate'    : GetVimDictOption(filePath1, 'Syslog.loggers.vmkernel.rotate')
        }
    ]
    return {
        'server'    : SearchInText(filePath4, keyword4, default='Unknown'),
        'config'    : config
    }


def GetDateStatus(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'ntpq_-p.txt')
    keyword  = r"^([-*#+ x.o]\S+)[ ].*$"
    remotes = SearchInText(filePath, keyword, multi=True)
    if remotes:
        servers = []
        for remote in remotes:
            servers.append({
                'remote'    : remote[1:],
                'status'    : '* (sys.peer)'     if remote[0] == '*' else
                              '# (selected)'     if remote[0] == '#' else
                              '+ (candidate)'    if remote[0] == '+' else
                              '<space> (excess)' if remote[0] == ' ' else
                              'x (falseticker)'  if remote[0] == 'x' else
                              '- (outlayer)'     if remote[0] == '-' else
                              '. (excess)'       if remote[0] == '.' else
                              'o (pps.peer)'     if remote[0] == 'o' else
                              'Unknown'
            })
    else:
        servers = [{
            'remote'    : 'n/a',
            'status'    : 'n/a'
        }]
    return {
        'ntp'   : servers
    }


def GetMachineModel(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/value[@name="product-name"]'
    return SearchInXml(filePath, xpath)


def GetMachineSerialNumber(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/value[@name="serial-number"]'
    return SearchInXml(filePath, xpath)


def GetBiosVersion(dirPath):
    filePath  = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/value[@name="bios-version"]'
    smbiosPath = os.path.join(dirPath, 'commands', 'smbiosDump.txt')
    keyword  = r"^.*System BIOS release: (.*)$"
    return SearchInXml(filePath, xpath, default='Unknown') + ' ' + SearchInText(smbiosPath, keyword, default='')


def GetBmcVersion(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/value[@name="bmc-version"]'
    return SearchInXml(filePath, xpath)


def GetCpuInfo(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'smbiosDump.txt')
    keyword  = r"^.*\"(Intel\(R\) Xeon\(R\).*)\"$"
    model    = SearchInText(filePath, keyword, default='Unknown')
    #
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    return {
        'model'     : model,
        'sockets'   : _int(SearchInXml(filePath, './hardware-info/cpu-info/value[@name="num-packages"]')),
        'cores'     : _int(SearchInXml(filePath, './hardware-info/cpu-info/value[@name="num-cores"]')),
        'htEnable'  : SearchInXml(filePath, './hardware-info/cpu-info/value[@name="hyperthreading-active"]') == 'true'
    }


def GetMemory(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/memory-info/value[@name="physical-mem"]'
    memory   = SearchInXml(filePath, xpath)
    return _int(memory, calc=lambda x: x // 1024 // 1024 // 1024 + 1)


def GetNumOfNumaNodes(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/memory-info/value[@name="num-numa-nodes"]'
    nodes    = SearchInXml(filePath, xpath)
    return _int(nodes)


def convertSBDFForHPEServer(sbdf):
    repattern = re.compile(r"^PCI ([0-9]+):([0-9]+):([0-9]+):([0-9]+)$")
    match = repattern.match(sbdf)
    if match:
        seg  = _int(match.groups()[0])
        bus  = _int(match.groups()[1])
        dev  = _int(match.groups()[2])
        func = _int(match.groups()[3])
        return '%04x:%02x:%02x.%01x' % (seg, bus, dev, func)
    return sbdf


def GetPciCards(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './hardware-info/pci-info/all-pci-devices/pci-device'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    filePath2 = os.path.join(dirPath, 'commands', 'vmware-vimdump_-o----U-dcui.txt')
    #
    cards = []
    for node in nodes:
        name   = node.findtext('./value[@name="device-name"]')
        seg    = _int(node.findtext('./value[@name="segment"]'), base=16)
        bus    = _int(node.findtext('./value[@name="bus"]'), base=16)
        dev    = _int(node.findtext('./value[@name="slot"]'), base=16)
        func   = _int(node.findtext('./value[@name="function"]'), base=16)
        sbdf   = '%04x:%02x:%02x.%01x' % (seg, bus, dev, func)
        slot   = _int(node.findtext('./value[@name="physical-slot"]'))
        slot   = slot if (slot <= 32) else (slot - 2080) # WA for HPE Superdome Flex
        parent = node.findtext('./value[@name="parent-device"]')
        if (func == 0) and (slot >= 1) and (slot <= 32) and (len(parent) > 0):
            dpios  = GetVimDictDpioDevices(filePath2)
            sriovs = GetVimDictSriovDevices(filePath2)
            cards.append({
                'slot'          : slot,
                'device'        : name,
                'sbdf'          : sbdf,
                'parent'        : convertSBDFForHPEServer(parent),
                'dpio_enabled'  : sbdf in dpios,
                'sriov_enabled' : sbdf in sriovs,
                'sriov_vfs'     : 0 if sbdf not in sriovs else sriovs[sbdf]
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
        seg  = _int(node.findtext('./pci-device/value[@name="segment"]'), base=16)
        bus  = _int(node.findtext('./pci-device/value[@name="bus"]'), base=16)
        dev  = _int(node.findtext('./pci-device/value[@name="slot"]'), base=16)
        func = _int(node.findtext('./pci-device/value[@name="function"]'), base=16)
        if (seg is not None) and (bus is not None) and (dev is not None) and (func is not None):
            nics.append({
                'name'      : node.findtext('./value[@name="name"]'),
                'speed'     : _int(node.findtext('./value[@name="actual-speed"]')),
                'linkup'    : node.findtext('./value[@name="link-up"]') == 'true',
                'mtu'       : _int(node.findtext('./value[@name="mtu"]')),
                'sbdf'      : '%04x:%02x:%02x:%01x' % (seg, bus, dev, func),
                'device'    : node.findtext('./pci-device/value[@name="device-name"]'),
                'port'      : 'Device %s, Port %s' % (slot, func),
                'mac'       : node.findtext('./value[@name="mac-address"]'),
                'driver'    : node.findtext('./value[@name="driver"]')
            })
    nics.sort(key=lambda x: int(re.search(r"[0-9]+", x['name']).group()))
    return nics


LoadBalancingPolicies = {
    'lb_srcid'      : 'Route based on the originating portID',
    'lb_srcmac'     : 'Route based on source MAC hash',
    'lb_ip'         : 'Route based on IP hash',
    'fo_explicit'   : 'Use explicit failover order'
}
def GetVswitches(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './network-info/virtual-switch-info/virtual-switches/virtual-switch'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    switches = []
    for node in nodes:
        switches.append({
            'name'          : node.findtext('./value[@name="name"]'),
            'uplink_active' : node.findtext('./effective-teaming-policy/value[@name="uplink-order"]').split(',')[:int(node.findtext('./effective-teaming-policy/value[@name="max-active-uplinks"]'))],
            'uplink_standby': node.findtext('./effective-teaming-policy/value[@name="uplink-order"]').split(',')[int(node.findtext('./effective-teaming-policy/value[@name="max-active-uplinks"]')):],
            'uplink_unused' : list(set(node.findtext('./value[@name="uplinks"]').split(',')) ^ set(node.findtext('./effective-teaming-policy/value[@name="uplink-order"]').split(','))),
            'mtu'           : _int(node.findtext('./value[@name="mtu"]')),
            'balance'       : LoadBalancingPolicies[node.findtext('./effective-teaming-policy/value[@name="teaming-policy"]')],
            'detection'     : 'beacon' if node.findtext('./value[@name="beacon-enabled"]') == 'true' else 'link-down',
            'failback'      : node.findtext('./effective-teaming-policy/value[@name="rolling-restoration"]') == 'false'
        })
    switches.sort(key=lambda x: x['name'])
    return switches


def GetPortgroups(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './network-info/virtual-switch-info/virtual-switches/virtual-switch/port-groups/port-group'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    xpath    = './network-info/virtual-switch-info/virtual-switches/virtual-switch'
    switches = GetXmlNode(filePath, xpath, multi=True)
    #
    portgroups = []
    for node in nodes:
        uplinks = 'unknown'
        for switch in switches:
            if switch.findtext('./value[@name="name"]') == node.findtext('./value[@name="virtual-switch"]'):
                uplinks = switch.findtext('./value[@name="uplinks"]')
        portgroups.append({
            'name'          : node.findtext('./value[@name="name"]'),
            'vswitch'       : node.findtext('./value[@name="virtual-switch"]'),
            'vlan'          : _int(node.findtext('./value[@name="vlan-id"]')),
            'uplink_active' : node.findtext('./effective-teaming-policy/value[@name="uplink-order"]').split(',')[:int(node.findtext('./effective-teaming-policy/value[@name="max-active-uplinks"]'))],
            'uplink_standby': node.findtext('./effective-teaming-policy/value[@name="uplink-order"]').split(',')[int(node.findtext('./effective-teaming-policy/value[@name="max-active-uplinks"]')):],
            'uplink_unused' : list(set(uplinks.split(',')) ^ set(node.findtext('./effective-teaming-policy/value[@name="uplink-order"]').split(','))),
            'balance'       : LoadBalancingPolicies[node.findtext('./effective-teaming-policy/value[@name="teaming-policy"]')],
            'failback'      : node.findtext('./effective-teaming-policy/value[@name="rolling-restoration"]') == 'false'
        })
    portgroups.sort(key=lambda x: x['name'])
    return portgroups


def GetVMKernelNics(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './network-info/vmkernel-nic-info/kernel-nics/vmkernel-nic'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    vmknics = []
    for node in nodes:
        vmknics.append({
            'name'      : node.findtext('./value[@name="interface"]'),
            'ip'        : node.findtext('./actual-ip-settings/ipv4-settings/value[@name="ipv4-address"]'),
            'portgroup' : node.findtext('./value[@name="port-group"]'),
            'mtu'       : _int(node.findtext('./value[@name="mtu"]')),
            'mac'       : node.findtext('./value[@name="mac-address"]')
        })
    vmknics.sort(key=lambda x: x['name'])
    return vmknics


def GetHbas(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './storage-info/all-scsi-iface/*/scsi-interface'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    hbas = []
    for node in nodes:
        slot = node.findtext('./pci-device/value[@name="slot-description"]', default='Unknown')
        seg  = _int(node.findtext('./pci-device/value[@name="segment"]'), base=16)
        bus  = _int(node.findtext('./pci-device/value[@name="bus"]'), base=16)
        dev  = _int(node.findtext('./pci-device/value[@name="slot"]'), base=16)
        func = _int(node.findtext('./pci-device/value[@name="function"]'), base=16)
        if (seg is not None) and (bus is not None) and (dev is not None) and (func is not None):
            hbas.append({
                'name'      : node.findtext('./value[@name="name"]'),
                'sbdf'      : '%04x:%02x:%02x:%01x' % (seg, bus, dev, func),
                'device'    : node.findtext('./pci-device/value[@name="device-name"]'),
                'port'      : 'Device %s, Port %s' % (slot, func),
                'wwn'       : node.findtext('./value[@name="uid"]')[-16:],
                'driver'    : node.findtext('./value[@name="driver"]')
            })
    hbas.sort(key=lambda x: int(re.search(r"[0-9]+", x['name']).group()))
    return hbas


def GetDisks(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './storage-info/all-scsi-iface/*/scsi-interface/paths/scsi-path'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    disks = []
    for node in nodes:
        lunNode = node.find('./disk-lun/lun')
        if lunNode is None:
            continue
        #
        name    = node.findtext('./value[@name="device-identifier"]')
        adapter = node.findtext('./value[@name="adapter-name"]')
        for disk in disks:
            if name == disk['name']:
                disk['adapters'].append(adapter)
                disk['adapters'].sort()
                break
        else:
            vml = 'Unknown'
            for uid in lunNode.findall('./device-uids/device-uid'):
                if uid.findtext('./value[@name="uid"]').startswith('vml.'):
                    vml = uid.findtext('./value[@name="uid"]')
            storage = ' '.join([ \
                lunNode.findtext('./value[@name="vendor"]').replace(' ', ''), \
                lunNode.findtext('./value[@name="model"]').replace(' ', ''), \
                lunNode.findtext('./value[@name="revision"]').replace(' ', '') \
            ])
            #
            bbFilePath = os.path.join(dirPath, 'commands', 'vmkfstools_-P--v-10-bootbank.txt')
            bbKeyword  = r"^Logical device: (naa.[0-9a-f]+):[0-9]+$"
            #
            vmfsName = 'n/a'
            vmfsPath = 'n/a'
            vmfsNodes = GetXmlNode(filePath, './storage-info/vmfs-filesystems/vm-filesystem', multi=True)
            for vmfsNode in vmfsNodes:
                for partNode in vmfsNode.findall('./extents/disk-lun-partition'):
                    if name in partNode.findtext('./value[@name="name"]'):
                        vmfsName = vmfsNode.findtext('./value[@name="volume-name"]')
                        vmfsPath = vmfsNode.findtext('./value[@name="console-path"]')
                        break
            #
            disks.append({
                'name'      : name,
                'vml'       : vml,
                'storage'   : storage,
                'size'      : _int(lunNode.findtext('./value[@name="size"]'), calc=lambda x: x // 1024 // 1024 // 1024),
                'adapters'  : [adapter],
                'nmp_psp'   : lunNode.findtext('./nmp-device-configuration/value[@name="path-selection-policy"]'),
                'nmp_satp'  : lunNode.findtext('./nmp-device-configuration/value[@name="storage-array-type"]'),
                'bootbank'  : SearchInText(bbFilePath, bbKeyword, default='Unknown') == name,
                'vmfsName'  : vmfsName,
                'vmfsPath'  : vmfsPath
            })
    disks.sort(key=lambda x: x['name'])
    return disks


def GetScsiDevices(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'esxcfg-info_-a--F-xml.txt')
    xpath    = './storage-info/all-scsi-iface/*/scsi-interface/paths/scsi-path'
    nodes    = GetXmlNode(filePath, xpath, multi=True)
    if nodes is None:
        return []
    #
    devices = []
    for node in nodes:
        lunNode = node.find('./lun')
        if lunNode is None:
            continue
        #
        name    = node.findtext('./value[@name="device-identifier"]')
        adapter = node.findtext('./value[@name="adapter-name"]')
        for device in devices:
            if name == device['name']:
                device['adapters'].append(adapter)
                device['adapters'].sort()
                break
        else:
            vml = 'Unknown'
            for uid in lunNode.findall('./device-uids/device-uid'):
                if uid.findtext('./value[@name="uid"]').startswith('vml.'):
                    vml = uid.findtext('./value[@name="uid"]')
            storage = ' '.join([ \
                lunNode.findtext('./value[@name="vendor"]').replace(' ', ''), \
                lunNode.findtext('./value[@name="model"]').replace(' ', ''), \
                lunNode.findtext('./value[@name="revision"]').replace(' ', '') \
            ])
            #
            devices.append({
                'name'      : name,
                'vml'       : vml,
                'storage'   : storage,
                'size'      : _int(lunNode.findtext('./value[@name="size"]'), calc=lambda x: x // 1024 // 1024 // 1024),
                'adapters'  : [adapter],
                'nmp_psp'   : lunNode.findtext('./nmp-device-configuration/value[@name="path-selection-policy"]'),
                'nmp_satp'  : lunNode.findtext('./nmp-device-configuration/value[@name="storage-array-type"]')
            })
    devices.sort(key=lambda x: x['name'])
    return devices


def GetPackages(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'localcli_software-vib-list.txt')
    repattern = re.compile(r"^(\S+)[ ]+(\S+)[ ].*$")
    packages = []
    try:
        with open(filePath, 'r') as fp:
            title = 2
            for line in fp:
                if title:
                    title = title - 1
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
def convertSBDF(sbdf_dec):
    try:
        return '%04x:%02x:%02x.%01x' % (_int(sbdf_dec[0:5]), _int(sbdf_dec[6:9]), _int(sbdf_dec[10:12]), _int(sbdf_dec[13:14]))
    except Exception as e:
        logger.error(e)
        return sbdf_dec


def GetVmxPath(dirPath, vmName):
    filePath = os.path.join(dirPath, 'etc', 'vmware', 'hostd', 'vmInventory.xml')
    xpath    = './ConfigEntry/vmxCfgPath'
    for vmxFile in SearchInXml(filePath, xpath, multi=True, default=[]):
        if vmName == os.path.splitext(os.path.basename(vmxFile))[0]:
            return vmxFile[1:].replace(':', '_')  # Note: removed leading character '/'
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
    VmxDictCache[vmxPath] = vmxDict
    #
    return vmxDict


def GetVmxValue(vmxDict, param, default=None):
    return vmxDict[param] if param in vmxDict else default


def GetVmOptions(vmxDict):
    options = [
        ('uefi_secureBoot_enabled',                     'uefi.secureBoot.enabled',                      None),
        ('cpuid_coresPerSocket',                        'cpuid.coresPerSocket',                         None),
        ('numa_nodeAffinity',                           'numa.nodeAffinity',                            None),
        ('numa_vcpu_maxPerMachineNode',                 'numa.vcpu.maxPerMachineNode',                  None),
        ('numa_vcpu_maxPerVirtualNode',                 'numa.vcpu.maxPerVirtualNode',                  None),
        ('numa_autosize',                               'numa.autosize',                                None),
        ('numa_autosize_vcpu_maxPerVirtualNode',        'numa.autosize.vcpu.maxPerVirtualNode',         None),
        ('sched_cpu_affinity',                          'sched.cpu.affinity',                           None),
        ('sched_cpu_latencySensitivity',                'sched.cpu.latencySensitivity',                 None),
        ('sched_cpu_min',                               'sched.cpu.min',                                None),
        ('sched_mem_pin',                               'sched.mem.pin',                                None),
        ('latency_enforceCpuMin',                       'latency.enforceCpuMin',                        None),
        ('timeTracker_apparentTimeIgnoresInterrupts',   'timeTracker.apparentTimeIgnoresInterrupts',    None)
    ]
    #
    vmOptions = {}
    for option in options:
        vmOptions[option[0]] = GetVmxValue(vmxDict, option[1], default=option[2])
    return vmOptions


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


def GetVmSnapshot(vmsdDict):
    generation = GetVmxValue(vmsdDict, 'snapshot.current', 0)
    return True if generation > 0 else False


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
                'slot'      : _int(vmxDict[ethernet + '.pciSlotNumber']),
                'mac'       : vmxDict[ethernet + '.generatedAddress'] if (ethernet + '.generatedAddress' in vmxDict) else None
            })
    vmNics.sort(key=lambda x: x['name'])
    return vmNics


def GetVmScsis(vmxDict):
    repattern = re.compile(r"^(scsi[0-9]+)[.]present$")
    vmScsis = []
    for key in vmxDict.keys():
        match = repattern.match(key)
        if match:
            scsi = match.groups()[0]
            vmScsis.append({
                'name'      : scsi,
                'device'    : vmxDict[scsi + '.virtualDev'],
                'present'   : vmxDict[scsi + '.present'] == 'TRUE',
                'slot'      : _int(vmxDict[scsi + '.pciSlotNumber'])
            })
    vmScsis.sort(key=lambda x: x['name'])
    return vmScsis


def GetVmDiskSizeGB(vmxPath, vmdkName):
    repattern = re.compile(r"^RW ([0-9]+) .*$")
    #
    try:
        with open(os.path.join(os.path.dirname(vmxPath), vmdkName), 'r') as fp:
            for line in fp:
                match = repattern.match(line)
                if match:
                    return _int(match.groups()[0]) // 1024 // 1024 * 512 // 1024
    except Exception as e:
        logger.error(e)
        return 'Unknown'
    return 'Unknown'


def GetVmDiskType(vmxPath, vmdkName):
    repattern = re.compile(r"^ddb.thinProvisioned = \"(1)\"$")
    #
    try:
        with open(os.path.join(os.path.dirname(vmxPath), vmdkName), 'r') as fp:
            for line in fp:
                match = repattern.match(line)
                if match:
                    return 'thin'
    except Exception as e:
        logger.error(e)
        return 'Unknown'
    return 'thick'


def GetVmRdmInfo(vmxPath, vmdkName):
    pattern = "Disk %s is a Passthrough Raw Device Mapping" % vmdkName
    #
    try:
        dirPath = os.path.dirname(vmxPath)
        for filePath in os.listdir(dirPath):
            if os.path.basename(filePath).startswith('dump-vmdk-rdm-info'):
                with open(os.path.join(dirPath, filePath), 'r') as fp:
                    contents = fp.read().split('\n')
                for index, content in enumerate(contents):
                    if content == pattern:
                        return contents[index + 1][-58:]
    except Exception as e:
        logger.error(e)
        return 'Unknown'
    return 'Unknown'


def GetVmDisks(vmxPath, vmxDict):
    repattern = re.compile(r"^(scsi[0-9]+:[0-9]+)[.]present$")
    vmDisks = []
    for key in vmxDict.keys():
        match = repattern.match(key)
        if match:
            scsi = match.groups()[0]
            mode = vmxDict[scsi + '.mode'] if (scsi + '.mode' in vmxDict) else None
            vmdk = vmxDict[scsi + '.fileName']
            pdisk = GetVmRdmInfo(vmxPath, vmdk) if (mode == 'independent-persistent') else None
            type = 'rdm'                        if (mode == 'independent-persistent') else GetVmDiskType(vmxPath, vmdk)
            vmDisks.append({
                'name'      : scsi,
                'device'    : vmxDict[scsi + '.deviceType'],
                'size'      : GetVmDiskSizeGB(vmxPath, vmdk),
                'mode'      : mode,
                'type'      : type,
                'pdisk'     : pdisk,
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
                'id'        : convertSBDF(vmxDict[pciPassthru + '.id']),
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
                'id'        : convertSBDF(vmxDict[pciPassthru + '.id']),
                'pfid'      : convertSBDF(vmxDict[pciPassthru + '.pfId']),
                'portgroup' : vmxDict[pciPassthru + '.networkName'],
                'present'   : vmxDict[pciPassthru + '.present'] == 'TRUE',
                'slot'      : int(vmxDict[pciPassthru + '.pciSlotNumber']),
                'mac'       : vmxDict[pciPassthru + '.generatedMACAddress'] if (pciPassthru + '.generatedAddress' in vmxDict) else None
            })
    vmSriovVfs.sort(key=lambda x: x['slot'])
    return vmSriovVfs


################################################################################
### Internal Functions - Get vCenter Server Information
################################################################################
def GetVCenterName(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'uname_-a.txt')
    keyword  = r"^Linux[ ](\S+)[ ].*$"
    return SearchInText(filePath, keyword)


def GetVCenterVersion(dirPath):
    filePath = os.path.join(dirPath, 'etc', 'vmware', '.buildInfo')
    keyword  = r"^SUMMARY:(.*)$"
    return SearchInText(filePath, keyword)


def GetVCenterBuild(dirPath):
    filePath = os.path.join(dirPath, 'etc', 'vmware', '.buildInfo')
    keyword  = r"^BUILDNUMBER:(.*)$"
    return SearchInText(filePath, keyword)


def GetVCenterUptime(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'uptime.txt')
    keyword  = r"^.*up (.*),[ ]+[0-9]+[ ]users.*"
    return SearchInText(filePath, keyword, default=0)


def GetVSanInfo(dirPath):
    filePath = os.path.join(dirPath, 'commands', 'python_usrlibvmware-vpxvsan-healthvsan-vc-health-statuspy-rvc-basic-support-information.txt')
    return GetVSanDict(filePath)
