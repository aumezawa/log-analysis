#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = ['setupCacheName', 'setupLogger', 'readCache', 'writeCache']
__author__  = 'aumezawa'
__version__ = '1.0.0'


################################################################################
### Required Modules
################################################################################
import json
import os


################################################################################
### Global Variables
################################################################################
filename = 'cache.json'
logger = None


################################################################################
### External Functions
################################################################################
def setupCacheName(name):
    global filename
    filename = name
    return


def setupLogger(obj):
    global logger
    logger = obj
    return


def readCache(dirPath, key, rev):
    cacheFile = os.path.join(dirPath, filename)
    cache = readCahceFile(cacheFile)
    if key in cache:
        if 'format' in cache[key]:
            if rev == cache[key]['format']:
                if logger:
                    logger.info('Hitted cache: %s, %s.' % (key, rev))
                return cache[key]
    return None


def writeCache(dirPath, key, value):
    cacheFile = os.path.join(dirPath, filename)
    cache = readCahceFile(cacheFile)
    cache[key] = value
    writeCacheFile(cacheFile, cache)
    if logger:
        logger.info('Updated cache: %s.' % (key))
    return


################################################################################
### Internal Functions
################################################################################
def readCahceFile(filePath):
    dict = {}
    try:
        with open(filePath, 'r') as fp:
            dict = json.load(fp)
    except Exception as e:
        if logger:
            logger.info(e)
        return {}
    return dict


def writeCacheFile(filePath, dict):
    try:
        with open(filePath, 'w') as fp:
            json.dump(dict, fp)
    except Exception as e:
        if logger:
            logger.info(e)
        return
    return
