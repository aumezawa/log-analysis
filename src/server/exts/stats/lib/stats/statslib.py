#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = ['extractStatsName', 'convertCsv2Database', 'getStatsCounters', 'getStatsData']
__author__  = 'aumezawa'
__version__ = '0.0.1'


################################################################################
### Required Modules
################################################################################
from datetime import datetime as dt
import json
import logging
import os
import re
import sqlite3
import sys


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
### Internal Parameters
################################################################################
DB_VERSION  = 1
COMMIT_SIZE = 1000


################################################################################
### External Functions
################################################################################
def extractStatsName(csvFile):
    meta = getMetaData(csvFile)
    if meta is None:
        return 'Unknown'
    #
    basename = getBasename(meta)
    return basename


def convertCsv2Database(csvFile, preserve=False):
    meta = getMetaData(csvFile)
    if meta is None:
        return None
    #
    basename = getBasename(meta)
    infoFile = os.path.join(os.path.dirname(csvFile), basename) + '.inf'
    if not saveMetaData(meta, infoFile):
        return None
    #
    # Create DB
    dbFile = os.path.join(os.path.dirname(csvFile), basename) + '.db'
    db, cur = connectDB(dbFile)
    if db is None:
        return None
    #
    # Create tables
    mains = getMainGroups(meta)
    for main in mains:
        subs = getSubGroups(meta, main)
        for sub in subs:
            createTable(cur, getTableName(main, sub), getColumns(meta, main, sub))
    db.commit()
    #
    # Insert data into each table
    try:
        with open(csvFile, encoding='utf-8') as fp:
            fp.readline() ## drop first line
            index = 1
            for line in fp:
                data = pealLine(line).split(',')
                for main in mains:
                    subs = getSubGroups(meta, main)
                    for sub in subs:
                        insertData(cur, getTableName(main, sub), getColumns(meta, main, sub), extractData(data, getColumnIndexes(meta, main, sub)))
                if index % COMMIT_SIZE == 0:
                    db.commit()
                index = index + 1
    except Exception as e:
        logger.error(e)
        return None
    #
    db.commit()
    db.close()
    #
    if not preserve:
        os.remove(csvFile)
    #
    return basename


def getStatsCounters(dbFile):
    infoFile = dbFile.strip('.db') + '.inf'
    meta = loadMetaData(infoFile)
    return getAllColumns(meta)


def getStatsData(dbFile, counters, first=None, last=None):
    cnts = decodeCounters(counters)
    db, cur = connectDB(dbFile)
    if db is None:
        return None
    result = None
    for cnt in cnts:
        result = mergeData(result, selectData(cur, getTableName(cnt['main'], cnt['sub']), cnt['counters'].split('+'), first=first, last=last))
    db.close()
    return result


################################################################################
### Internal Functions - Performance Log
################################################################################

### "xxx","yyy",\n -> xxx,yyy
def pealLine(line):
    return line.replace('\n', '').replace('"', '').strip(',')


def getMetaData(csvFile):
    try:
        with open(csvFile, encoding='utf-8') as fp:
            titleLine = pealLine(fp.readline())
            firstLine = pealLine(fp.readline())
            lastLine  = firstLine
            for lastLine in fp:
                pass
            else:
                lastLine = pealLine(lastLine)
    except Exception as e:
        logger.error(e)
        return None
    #
    name    = titleLine.split(',')[1].split('\\')[2]
    first   = firstLine.split(',')[0]
    last    = lastLine.split(',')[0]
    #
    columns = {}
    repattern = re.compile(r"^([^()]+)\(([^()]+)\)$")
    for idx, col in enumerate(titleLine.split(',')[1:]):
        decoded = col.split("\\")
        if len(decoded) > 4:
            groups = decoded[3]
            counter = decoded[4]
        else:
            break
        #
        match = repattern.match(groups)
        if match:
            main = match.groups()[0]
            sub  = match.groups()[1]
        else:
            main = groups
            sub  = 'default'
        #
        if main in list(columns.keys()):
            if sub in list(columns[main].keys()):
                columns[main][sub].append({
                    'index' : idx + 1,
                    'name'  : counter
                })
            else:
                columns[main][sub] = [{
                    'index' : idx + 1,
                    'name'  : counter
                }]
        else:
            columns[main] = {}
            columns[main][sub] = [{
                'index' : idx + 1,
                'name'  : counter
            }]
    #
    return {
        'name'      : name,
        'version'   : DB_VERSION,
        'date'      : convertDate(first, "file"),
        'columns'   : columns,
        'first'     : convertDate(first),
        'last'      : convertDate(last)
    }


def saveMetaData(meta, infoFile):
    try:
        with open(infoFile, 'w') as fp:
            json.dump(meta, fp)
    except Exception as e:
        logger.error(e)
        return False
    return True


def loadMetaData(infoFile):
    try:
        with open(infoFile, 'r') as fp:
            meta = json.load(fp)
    except Exception as e:
        logger.error(e)
        return None
    return meta


def getBasename(meta):
    return '%s_%s_%s' % (meta['name'], meta['date'], meta['version'])


def getMainGroups(meta):
    columns = meta['columns']
    return list(columns.keys())


def getSubGroups(meta, main):
    columns = meta['columns']
    if main in list(columns.keys()):
        return list(columns[main].keys())
    return []


def getTableName(main, sub):
    if sub == 'default':
        return main
    else:
        return '%s(%s)' % (main, sub)


def getAllColumns(meta):
    columns = meta['columns']
    result = {
        main: {
            sub: list(map(lambda x: x['name'], counter)) for (sub, counter) in subs.items()
        } for (main, subs) in columns.items()
    }
    return result


def getColumns(meta, main, sub):
    columns = meta['columns']
    if main in list(columns.keys()) and sub in list(columns[main].keys()):
        return list(map(lambda x: x['name'], columns[main][sub]))
    return []


def getColumnIndexes(meta, main, sub):
    columns = meta['columns']
    if main in list(columns.keys()) and sub in list(columns[main].keys()):
        return list(map(lambda x: x['index'], columns[main][sub]))
    return []


def extractData(data, idxes):
    res = data[:1]
    res.extend(list(map(lambda x: data[x], idxes)))
    return res


def decodeCounters(counters):
    result = []
    for counter in counters.split(','):
        decoded = counter.split("->")
        if len(decoded) == 3:
            result.append({
                'main'      : decoded[0],
                'sub'       : decoded[1],
                'counters'  : decoded[2]
            })
    return result


def mergeData(x, y):
    if x is None:
        return y
    if y is None:
        return x
    #
    if len(x) != len(y):
        return None
    #
    result = []
    for i, a in enumerate(x):
        b = {}
        b.update(a)
        b.update(y[i])
        result.append(b)
    return result


################################################################################
### Internal Functions - Date
################################################################################

### MM/DD/YYYY hh:mm:ss -> UTC or YYYYMMDDhhmmss
def convertDate(date, mode='utc'):
    repattern = re.compile(r"^([0-9]{2})\/([0-9]{2})\/([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$")
    match = repattern.match(date)
    if match:
        if mode == "file":
            return "%s%s%s%s%s%s" % (match.groups()[2], match.groups()[0], match.groups()[1], match.groups()[3], match.groups()[4], match.groups()[5])
        else:
            return "%s-%s-%sT%s:%s:%sZ" % (match.groups()[2], match.groups()[0], match.groups()[1], match.groups()[3], match.groups()[4], match.groups()[5])
    return "Unknown"


def inTime(now, before, after):
    if before is not None:
        if dt.strptime(before, '%Y-%m-%dT%H:%M:%SZ') > dt.strptime(now, '%Y-%m-%dT%H:%M:%SZ'):
            return False
    if after is not None:
        if dt.strptime(now, '%Y-%m-%dT%H:%M:%SZ') > dt.strptime(after, '%Y-%m-%dT%H:%M:%SZ'):
            return False
    return True


################################################################################
### Internal Functions - SQL
################################################################################
def connectDB(dbFile):
    try:
        db = sqlite3.connect(dbFile)
        cur = db.cursor()
    except Exception as e:
        logger.error(e)
        return (None, None)
    return (db, cur)


def createTable(cur, table, cols):
    columns = ','.join(list(map(lambda x: '"%s" NUMERIC' % (x), cols)))
    #
    try:
        cur.execute('DROP TABLE if exists "%s"' % (table))
        cur.execute('CREATE TABLE "%s" (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, %s)' % (table, columns))
    except Exception as e:
        logger.error(e)
        return False
    return True


def insertData(cur, table, cols, data):
    columns = ','.join(list(map(lambda x: '"%s"' % (x), cols)))
    date = convertDate(data[0])
    values = ','.join(data[1:])
    #
    try:
        cur.execute('INSERT INTO "%s" (date,%s) VALUES ("%s",%s)' % (table, columns, date, values))
    except Exception as e:
        logger.error(e)
        return False
    return True


def selectData(cur, table, cols, first=None, last=None):
    columns = ','.join(list(map(lambda x: '"%s"' % (x), cols)))
    #
    try:
        cur.execute('SELECT date,%s FROM "%s"' % (columns, table))
    except Exception as e:
        logger.error(e)
        return None
    #
    result = []
    for row in cur.fetchall():
        date = row[0]
        if not inTime(date, first, last):
            continue
        data = {}
        data['date'] = date
        for index, col in enumerate(cols):
            data[table + '_' + col] = row[index + 1]
        result.append(data)
    return result
