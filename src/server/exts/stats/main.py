#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = []
__author__  = 'aumezawa'
__version__ = '0.2.0'


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
RET_BAD_FILE    = -5


################################################################################
### Load External Libraries
################################################################################
try:
    sys.path.append('lib/debug')
    import debuglib
    sys.path.append('lib/stats')
    import statslib
except Exception as e:
    print(e)
    sys.exit(RET_SYS_ERROR)


################################################################################
### Setup Logger
################################################################################
try:
    logger = logging.getLogger('file')
except Exception as e:
    print(e)
    sys.exit(RET_SYS_ERROR)


################################################################################
### Options
################################################################################
def GetArgs():
    # Supports the command-line arguments listed below.
    parser = argparse.ArgumentParser(
        prog='stats',
        description='Extract specific data from performance monitor data'
    )
    #
    group_common = parser.add_argument_group(
        title='common',
        description=None
    )
    group_common.add_argument('-l', '--log',
        action='store',
        default='.',
        required=False,
        help='set directory path of storing log files (optional)',
        metavar='<DIRPATH>'
    )
    group_common.add_argument('-n', '--basename',
        action='store_true',
        required=False,
        help='get basename of stats from csv ("-f" option will be needed)'
    )
    group_common.add_argument('-v', '--convert',
        action='store_true',
        required=False,
        help='convert csv to db ("-f" option will be needed)'
    )
    group_common.add_argument('-g', '--get',
        action='store_true',
        required=False,
        help='get information from db ("-db" option will be needed)'
    )
    #
    group_convert = parser.add_argument_group(
        title='convert',
        description=None
    )
    group_convert.add_argument('-f', '--csvfile',
        action='store',
        required=False,
        help='set source file path (.csv)',
        metavar='<FILEPATH>'
    )
    group_convert.add_argument('-p', '--preserve',
        action='store_true',
        default=False,
        help='preserve the original csv file (optional)',
    )
    #
    group_get = parser.add_argument_group(
        title='get information',
        description=None
    )
    group_get.add_argument('-db', '--database',
        action='store',
        required=False,
        help='set database path (.db)',
        metavar='<FILEPATH>'
    )
    group_get.add_argument('-ac', '--all_counters',
        action='store_true',
        required=False,
        help='get all counters',
    )
    group_get.add_argument('-nc', '--nonzero_counters',
        action='store_true',
        required=False,
        help='get non-zero counters',
    )
    group_get.add_argument('-vc', '--vitality_counters',
        action='store_true',
        required=False,
        help='get vitality counters',
    )
    group_get.add_argument('-sd', '--specific_data',
        action='store_true',
        required=False,
        help='get data ("-c" option will be needed)'
    )
    group_get.add_argument('-c', '--counters',
        action='store',
        required=False,
        help='set counter',
        metavar='<COUNTER> | <COUNTER1,COUNTER2,...>'
    )
    group_get.add_argument('-fd', '--first_date',
        action='store',
        required=False,
        help='set first date for data filtering',
        metavar='<UTC Format>'
    )
    group_get.add_argument('-ld', '--last_date',
        action='store',
        required=False,
        help='set last date for data filtering',
        metavar='<UTC Format>'
    )
    #
    args = parser.parse_args()
    return (args, parser)


################################################################################
### Internal Functions
################################################################################
def printResult(data):
    try:
        print(json.dumps(data, indent=2, sort_keys=True))
    except Exception as e:
        logger.error(e)
        sys.exit(RET_SYS_ERROR)
    return


################################################################################
### Main Function
################################################################################
if __name__ == '__main__':
    (args, parser) = GetArgs()
    #
    if not os.path.exists(args.log):
        parser.print_help()
        sys.exit(RET_NO_DIRECTORY)
    debuglib.SetupLogger(filename="stats.log", dirpath=args.log)
    #
    if args.basename:
        if args.csvfile:
            if not os.path.exists(args.csvfile):
                logger.error('No csv file found. - %s' % args.csvfile)
                sys.exit(RET_NO_FILE)
            #
            logger.info('Get basename of stats from csv. - %s' % args.csvfile)
            basename = statslib.extractStatsName(args.csvfile)
            if basename is None:
                logger.error('Failed in getting basename of stats from csv. - %s' % args.csvfile)
                sys.exit(RET_BAD_FILE)
            #
            printResult({'msg': 'Succeeded.', 'basename': basename})
            logger.info('Succeeded.')
            sys.exit(RET_NORMAL_END)
        # Bad options
        parser.print_help()
        sys.exit(RET_BAD_PARAM)
    #
    if args.convert:
        if args.csvfile:
            if not os.path.exists(args.csvfile):
                logger.error('No csv file found. - %s' % args.csvfile)
                sys.exit(RET_NO_FILE)
            #
            logger.info('Convert csv to database. - %s' % args.csvfile)
            basename = statslib.convertCsv2Database(args.csvfile, preserve=args.preserve)
            if basename is None:
                logger.error('Failed in convering csv to db. - %s' % args.csvfile)
                sys.exit(RET_BAD_FILE)
            #
            printResult({'msg': 'Succeeded.', 'basename': basename})
            logger.info('Succeeded.')
            sys.exit(RET_NORMAL_END)
        # Bad options
        parser.print_help()
        sys.exit(RET_BAD_PARAM)
    #
    if args.get:
        if args.database:
            if not os.path.exists(args.database):
                logger.error('No database found. - %s' % args.database)
                sys.exit(RET_NO_FILE)
            #
            if args.all_counters:
                logger.info('Get all counters from db. - %s' % args.database)
                counters = statslib.getStatsCounters(args.database, option='nonzero')
                if counters is None:
                    logger.error('Failed in getting all counters from db. - %s' % args.database)
                    sys.exit(RET_BAD_FILE)
                printResult({'msg': 'Succeeded.', 'counters': counters})
                logger.info('Succeeded.')
                sys.exit(RET_NORMAL_END)
            if args.nonzero_counters:
                logger.info('Get non-zero counters from db. - %s' % args.database)
                counters = statslib.getStatsCounters(args.database, option='nonzero')
                if counters is None:
                    logger.error('Failed in getting non-zero counters from db. - %s' % args.database)
                    sys.exit(RET_BAD_FILE)
                printResult({'msg': 'Succeeded.', 'counters': counters})
                logger.info('Succeeded.')
                sys.exit(RET_NORMAL_END)
            if args.vitality_counters:
                logger.info('Get vitality counters from db. - %s' % args.database)
                counters = statslib.getStatsCounters(args.database, option='vitality')
                if counters is None:
                    logger.error('Failed in getting vitality counters from db. - %s' % args.database)
                    sys.exit(RET_BAD_FILE)
                printResult({'msg': 'Succeeded.', 'counters': counters})
                logger.info('Succeeded.')
                sys.exit(RET_NORMAL_END)
            if args.specific_data:
                if args.counters:
                    logger.info('Get specific data from db. - counters = %s' % args.counters)
                    data = statslib.getStatsData(args.database, args.counters, first=args.first_date, last=args.last_date)
                    if data is None:
                        logger.error('Failed in getting specific data from db. - counters = %s' % args.counters)
                        sys.exit(RET_BAD_FILE)
                    printResult({'msg': 'Succeeded.', 'data': data})
                    logger.info('Succeeded.')
                    sys.exit(RET_NORMAL_END)
                # Bad options
                parser.print_help()
                sys.exit(RET_BAD_PARAM)
            # Bad options
            parser.print_help()
            sys.exit(RET_BAD_PARAM)
        # Bad options
        parser.print_help()
        sys.exit(RET_BAD_PARAM)
    # Bad options
    parser.print_help()
    sys.exit(RET_BAD_PARAM)
