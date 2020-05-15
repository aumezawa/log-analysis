#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = []
__author__  = 'aume'
__version   = '0.0.0'


################################################################################
### Required Modules
################################################################################
import argparse
import json
import logging
import os
import sys


################################################################################
### Error Codes
################################################################################
RET_NORMAL_END  =  0
RET_SYS_ERROR   = -1
RET_BAD_PARAM   = -2
RET_NO_FILE     = -3
RET_NO_DIRECTORY= -4


################################################################################
### Load External Libraries
################################################################################
try:
    sys.path.append('lib/debug')
    import debuglib
    sys.path.append('lib/vmlog')
    import vmlogtool
except Exception as e:
    print(e)
    sys.exit(RET_SYS_ERROR)


################################################################################
### Setup Logger
################################################################################
try:
    logger = logging.getLogger('vmtools')
except Exception as e:
    print(e)
    sys.exit(RET_SYS_ERROR)


################################################################################
###
################################################################################
def GetArgs():
    # Supports the command-line arguments listed below.
    parser = argparse.ArgumentParser(
        prog='vmtools',
        description='Comfortable Tool Set for VMware ESXi vm-support bundle'
    )
    #
    group_common = parser.add_argument_group(
        title='common',
        description=None
    )
    group_common.add_argument('-l', '--log',
        action='store',
        default='log',
        required=False,
        help='set directory path of storing log files (optional)',
        metavar='<DIRPATH>'
    )
    group_common.add_argument('-g', '--get',
        action='store_true',
        required=False,
        help='get information ("-b" option will be needed, "-e" or "-v" option will be needed)'
    )
    group_common.add_argument('-d', '--decomp',
        action='store_true',
        required=False,
        help='decompress log bundle ("-f" option will be needed)'
    )
    #
    group_get = parser.add_argument_group(
        title='get information',
        description=None
    )
    group_get.add_argument('-b', '--bundle',
        action='store',
        required=False,
        help='set directory path of log bundle',
        metavar='<DIRPATH>'
    )
    group_get.add_argument('-e', '--esx',
        action='store',
        required=False,
        help='LIST: get esx list, <NAME>: get a specific esx information',
        metavar='LIST | <NAME>'
    )
    group_get.add_argument('-v', '--vm',
        action='store',
        required=False,
        help='LIST: get vm list, <NAME>: get a specific vm information',
        metavar='LIST | <NAME>'
    )
    #
    group_decomp = parser.add_argument_group(
        title='decompress',
        description=None
    )
    group_decomp.add_argument('-f', '--file',
        action='store',
        required=False,
        help='set file path of log bundle (.tgz)',
        metavar='<FILEPATH>'
    )
    #
    args = parser.parse_args()
    return (args, parser)


def printResult(data):
    print(json.dumps(data, indent=2, sort_keys=True))
    return


################################################################################
### Main Function
################################################################################
if __name__ == '__main__':
    (args, parser) = GetArgs()
    #
    if not os.path.exists(args.log):
        printResult({'msg': 'No directory of logging found.'})
        sys.exit(RET_NO_DIRECTORY)
    debuglib.SetupLogger(dirpath=args.log)
    #
    if args.get:
        if args.bundle:
            if not os.path.exists(args.bundle):
                logger.error('No log bundle found. - %s' % args.bundle)
                sys.exit(RET_NO_DIRECTORY)
            #
            if args.esx:
                logger.info('Get ESXi Information. ESX = %s' % args.esx)
                if args.esx == 'LIST':
                    printResult(vmlogtool.GetHostList(args.bundle))
                else:
                    printResult(vmlogtool.GetHostInfo(args.bundle, args.esx))
                logger.info('Succeeded.')
                sys.exit(RET_NORMAL_END)
            if args.vm:
                logger.info('Get VM Information. VM = %s' % args.vm)
                if args.vm == 'LIST':
                    printResult(vmlogtool.GetVmList(args.bundle))
                else:
                    printResult(vmlogtool.GetVmInfo(args.bundle, args.vm))
                logger.info('Succeeded.')
                sys.exit(RET_NORMAL_END)
        # Bad options
        parser.print_help()
        sys.exit(RET_BAD_PARAM)
    #
    if args.decomp:
        if args.file:
            if not os.path.exists(args.file):
                logger.error('No log bundle found. - %s' % args.file)
                sys.exit(RET_NO_FILE)
            #
            logger.info('Decompress log bundle. - %s' % args.file)
            bundlePath = vmlogtool.DecompressBundle(args.file)
            printResult({'msg': 'Succeeded.', 'path': bundlePath})
            logger.info('Succeeded.')
            sys.exit(RET_NORMAL_END)
        # Bad options
        parser.print_help()
        sys.exit(RET_BAD_PARAM)
    # Bad options
    parser.print_help()
    sys.exit(RET_BAD_PARAM)
