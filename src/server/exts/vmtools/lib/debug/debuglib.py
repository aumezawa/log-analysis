#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = ['SetupLogger']
__author__  = 'aumezawa'
__version__ = '1.0.0'


################################################################################
### Required Modules
################################################################################
import logging
import logging.config
import os
import sys


################################################################################
### Error Codes
################################################################################
RET_NORMAL_END  =  0
RET_SYS_ERROR   = -1


################################################################################
### External Functions
################################################################################
def SetupLogger(filename='vmtools.log', dirpath='.', mode=logging.DEBUG):
    try:
        logging.config.dictConfig({
            'version': 1,
            'formatters': {
                'standerdFormatter': {
                    'format': '[%(asctime)s.%(msecs)03d] [%(levelname)s] - [%(process)d]: [%(filename)s] [%(funcName)s:%(lineno)d] %(message)s',
                    'datefmt': '%Y-%m-%dT%H:%M:%S'
                }
            },
            'handlers': {
                'consoleHandler': {
                    'class': 'logging.StreamHandler',
                    'level': mode,
                    'formatter': 'standerdFormatter'
                },
                'fileHandler': {
                    'class': 'logging.FileHandler',
                    'level': mode,
                    'formatter': 'standerdFormatter',
                    'filename': os.path.join(dirpath, filename),
                    'mode': 'a'
                }
            },
            'root': {
                'handlers': ['fileHandler'],
                'level': mode
            },
            'loggers': {
                'stdout': {
                    'handlers': ['consoleHandler'],
                    'level': mode,
                    'propagate': False
                },
                'vmtools': {
                    'handlers': ['fileHandler'],
                    'level': mode,
                    'propagate': False
                }
            }
        })
    except Exception as e:
        print(e)
        sys.exit(RET_SYS_ERROR)
