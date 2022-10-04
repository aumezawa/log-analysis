#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function
from unittest import result

__all__     = ['extractStatsName', 'convertCsv2Database', 'getStatsCounters', 'getStatsData']
__author__  = 'aumezawa'
__version__ = '0.2.0'


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
    converter = DbConverter(csvFile)
    meta = converter.createMeta()
    if meta is None:
        return 'Unknown'
    #
    return meta.getResourceName()


def convertCsv2Database(csvFile, preserve=False):
    converter = DbConverter(csvFile, preserve=preserve)
    db = converter.createDatabase()
    if db is None:
        return None
    #
    resouceName = db.getResourceName()
    del converter
    #
    return resouceName


def getStatsCounters(dbFile, option=None):
    db = Database(dbFile)
    if option == 'nonzero':
        return db.getColumnNonzeroCounters()
    elif option == 'vitality':
        return db.getColumnVitalityCounters(top=30)
    else:
        return db.getColumnAllCounters()


def getStatsData(dbFile, counters, first=None, last=None):
    db = Database(dbFile)
    return db.selectMultiData(counters)


################################################################################
### Class - Meta
################################################################################
class DbMeta:
    __resource  = None
    __valid     = False
    __name      = None
    __version   = DB_VERSION
    __date      = None
    __first     = None
    __last      = None
    __columns   = None
    __update    = False

    def __init__(self, infFile):
        self.__resource = infFile
        self.__load()
        pass

    def __del__(self):
        if self.__update:
            self.__save()
        pass

    @classmethod
    def create(cls, dirPath, name, date, first, last, columns):
        infFile = os.path.join(dirPath, '%s_%s_%s.inf' % (name, date, DB_VERSION))
        object = cls(infFile)
        object.__setParams(name, date, first, last, columns)
        object.__save()
        return object

    def __setParams(self, name, date, first, last, columns):
        self.__name = name
        self.__date = date
        self.__first = first
        self.__last = last
        self.__columns = columns
        self.__valid = True
        return

    def getWorkingDirectory(self):
        if not self.__valid:
            return None
        return os.path.dirname(self.__resource)

    def getResourceName(self):
        if not self.__valid:
            return None
        return '%s_%s_%s' % (self.__name, self.__date, self.__version)

    def getName(self):
        if not self.__valid:
            return None
        return self.__name

    def getVersion(self):
        if not self.__valid:
            return None
        return self.__version

    def getDate(self):
        if not self.__valid:
            return None
        return self.__date

    def getFirst(self):
        if not self.__valid:
            return None
        return self.__first

    def getLast(self):
        if not self.__valid:
            return None
        return self.__last

    def getColumns(self):
        if not self.__valid:
            return None
        return self.__columns

    def updateColumn(self, main, sub, counter, key, value):
        if not self.__valid:
            return False
        try:
            self.__columns[main][sub][counter][key] = value
            self.__update = True
        except Exception as e:
            logger.error(e)
            return False
        return True

    def getColumnMainGroups(self):
        if not self.__valid:
            return []
        if self.__columns is None:
            return []
        try:
            result = list(self.__columns.keys())
        except Exception as e:
            logger.error(e)
            return []
        return result

    def getColumnSubGroups(self, main):
        if not self.__valid:
            return []
        if self.__columns is None:
            return []
        if main not in self.getColumnMainGroups():
            return []
        try:
            result = list(self.__columns[main].keys())
        except Exception as e:
            logger.error(e)
            return []
        return result

    def getColumnCounters(self, main, sub, key=None):
        if not self.__valid:
            return []
        if self.__columns is None:
            return []
        if main not in self.getColumnMainGroups() or sub not in self.getColumnSubGroups(main):
            return []
        try:
            if key is None:
                result = list(self.__columns[main][sub].keys())
            else:
                result = list(map(lambda x: x[key], self.__columns[main][sub].values()))
        except Exception as e:
            logger.error(e)
            return []
        return result

    def getColumnAllCounters(self):
        if not self.__valid:
            return {}
        if self.__columns is None:
            return {}
        try:
            result = {
                main: {
                    sub: list(counters.keys()) for (sub, counters) in subs.items()
                } for (main, subs) in self.__columns.items()
            }
        except Exception as e:
            logger.error(e)
            return {}
        return result

    def getColumnNonzeroCounters(self):
        if not self.__valid:
            return {}
        if self.__columns is None:
            return {}
        try:
            result = {
                main: {
                    sub: list(map(lambda x: x['name'], filter(lambda x: x['average'] >= 1, counters.values()))) for (sub, counters) in subs.items()
                } for (main, subs) in self.__columns.items()
            }
            cleanupNestedDict(result, level=2)
        except Exception as e:
            logger.error(e)
            return {}
        return result

    def getColumnVitalityCounters(self, top=10):
        if not self.__valid:
            return {}
        if self.__columns is None:
            return {}
        try:
            vals = []
            for main in self.__columns:
                for sub in self.__columns[main]:
                    for counter in self.__columns[main][sub]:
                        vals.append(self.__columns[main][sub][counter]['variance'])
            vals.sort(reverse=True)
            result = {
                main: {
                    sub: list(map(lambda x: x['name'], filter(lambda x: x['variance'] >= vals[top-1], counters.values()))) for (sub, counters) in subs.items()
                } for (main, subs) in self.__columns.items()
            }
            cleanupNestedDict(result, level=2)
        except Exception as e:
            logger.error(e)
            return {}
        return result

    def getDatabaseTableName(self, main, sub, check=False):
        if not self.__valid:
            return None
        if check:
            if main not in self.getColumnMainGroups() or sub not in self.getColumnSubGroups(main):
                return ''
        #
        if sub == 'default':
            return main
        else:
            return '%s(%s)' % (main, sub)

    def __save(self):
        try:
            with open(self.__resource, 'w') as fp:
                json.dump({
                    'name'      : self.__name,
                    'version'   : self.__version,
                    'date'      : self.__date,
                    'columns'   : self.__columns,
                    'first'     : self.__first,
                    'last'      : self.__last
                }, fp)
        except Exception as e:
            logger.error(e)
            return False
        return True

    def __load(self):
        if not os.path.exists(self.__resource):
            return False
        try:
            with open(self.__resource, 'r') as fp:
                meta = json.load(fp)
                self.__name     = meta['name']
                self.__version  = meta['version']
                self.__date     = meta['date']
                self.__columns  = meta['columns']
                self.__first    = meta['first']
                self.__last     = meta['last']
                self.__valid    = True
        except Exception as e:
            logger.error(e)
            return False
        return True

    def update(self):
        if self.__update:
            self.__update = False
            return self.__save()
        return True


################################################################################
### Class - Database
################################################################################
class Database:
    __resouce   = None
    __meta      = None
    __date      = None
    __db        = None
    __cursor    = None

    def __init__(self, dbFile, date=True):
        self.__resouce = dbFile
        self.__meta = DbMeta(dbFile.replace('.db', '.inf'))
        self.__date = date
        self.__connect()
        pass

    def __del__(self):
        try:
            if self.__db is not None:
                self.__db.close()
        except Exception as e:
            logger.error(e)
        pass

    def __connect(self):
        if self.__resouce is None:
            return False
        try:
            self.__db = sqlite3.connect(self.__resouce)
            self.__cursor = self.__db.cursor()
        except Exception as e:
            logger.error(e)
            return False
        return True

    def commit(self):
        if self.__db is None:
            return False
        try:
            self.__db.commit()
        except Exception as e:
            logger.error(e)
            return False
        return True

    def update(self):
        return self.__meta.update()

    def getResourceName(self):
        return self.__meta.getResourceName()

    def updateColumn(self, main, sub, counter, key, value):
        return self.__meta.updateColumn(main, sub, counter, key, value)

    def getColumnMainGroups(self):
        return self.__meta.getColumnMainGroups()

    def getColumnSubGroups(self, main):
        return self.__meta.getColumnSubGroups(main)

    def getColumnCounters(self, main, sub, key=None):
        return self.__meta.getColumnCounters(main, sub, key=key)

    def getColumnAllCounters(self):
        return self.__meta.getColumnAllCounters()

    def getColumnNonzeroCounters(self):
        return self.__meta.getColumnNonzeroCounters()

    def getColumnVitalityCounters(self, top=10):
        return self.__meta.getColumnVitalityCounters(top=top)

    def getDatabaseTableName(self, main, sub):
        return self.__meta.getDatabaseTableName(main, sub)

    def createTable(self, table, cols):
        if self.__db is None or self.__cursor is None:
            return False
        #
        try:
            columns = ','.join(list(map(lambda x: '"%s" NUMERIC' % (x), cols)))
            self.__cursor.execute('DROP TABLE if exists "%s"' % (table))
            if self.__date:
                self.__cursor.execute('CREATE TABLE "%s" (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, %s)' % (table, columns))
            else:
                self.__cursor.execute('CREATE TABLE "%s" (id INTEGER PRIMARY KEY AUTOINCREMENT, %s)' % (table, columns))
        except Exception as e:
            logger.error(e)
            return False
        return True

    def insertData(self, table, cols, data):
        if self.__db is None or self.__cursor is None:
            return False
        #
        try:
            columns = ','.join(list(map(lambda x: '"%s"' % (x), cols)))
            values = ','.join(data)
            if self.__date:
                self.__cursor.execute('INSERT INTO "%s" (date,%s) VALUES (%s)' % (table, columns, values))
            else:
                self.__cursor.execute('INSERT INTO "%s" (%s) VALUES (%s)' % (table, columns, values))
        except Exception as e:
            logger.error(e)
            return False
        return True

    def selectData(self, table, cols, first=None, last=None):
        if self.__db is None or self.__cursor is None:
            return []
        #
        try:
            columns = ','.join(list(map(lambda x: '"%s"' % (x), cols)))
            if self.__date:
                self.__cursor.execute('SELECT date,%s FROM "%s"' % (columns, table))
            else:
                self.__cursor.execute('SELECT %s FROM "%s"' % (columns, table))
        except Exception as e:
            logger.error(e)
            return []
        #
        result = []
        for row in self.__cursor.fetchall():
            data = {}
            base = 0
            if self.__date:
                date = row[0]
                # TODO
                #if not inTime(date, first, last):
                #    continue
                data['date'] = date
                base = 1
            for index, col in enumerate(cols):
                data[table + '_' + col] = row[index + base]
            result.append(data)
        return result

    def countOfData(self, table, cols):
        if self.__db is None or self.__cursor is None:
            return []
        #
        try:
            columns = ','.join(list(map(lambda x: 'count("%s")' % (x), cols)))
            self.__cursor.execute('SELECT %s FROM "%s"' % (columns, table))
        except Exception as e:
            logger.error(e)
            return []
        #
        result = []
        for row in self.__cursor.fetchall():
            for index in range(len(cols)):
                result.append(row[index])
        return result

    def sumOfData(self, table, cols):
        if self.__db is None or self.__cursor is None:
            return []
        #
        try:
            columns = ','.join(list(map(lambda x: 'total("%s")' % (x), cols)))
            self.__cursor.execute('SELECT %s FROM "%s"' % (columns, table))
        except Exception as e:
            logger.error(e)
            return []
        #
        result = []
        for row in self.__cursor.fetchall():
            for index in range(len(cols)):
                result.append(row[index])
        return result

    def averageOfData(self, table, cols):
        if self.__db is None or self.__cursor is None:
            return []
        #
        counts = self.countOfData(table, cols)
        sums = self.sumOfData(table, cols)
        if len(counts) != len(cols) or len(sums) != len(cols):
            return []
        #
        result = []
        for index in range(len(cols)):
            result.append(sums[index] / counts[index])
        return result

    def varianceOfData(self, table, cols):
        if self.__db is None or self.__cursor is None:
            return []
        #
        counts = self.countOfData(table, cols)
        avgs = self.averageOfData(table, cols)
        if len(counts) != len(cols) or len(avgs) != len(cols):
            return []
        #
        columns = ','.join(list(map(lambda x: '"%s"' % (x), cols)))
        try:
            self.__cursor.execute('SELECT %s FROM "%s"' % (columns, table))
        except Exception as e:
            logger.error(e)
            return []
        #
        result = [ 0 for i in range(len(cols)) ]
        for row in self.__cursor.fetchall():
            for index in range(len(cols)):
                result[index] = result[index] + pow(row[index] - avgs[index], 2)
        for index in range(len(cols)):
            result[index] = result[index] / counts[index]
        return result

    def __decodeCounters(self, counters):
        result = []
        for counter in counters.split(','):
            decoded = counter.split("->")
            if len(decoded) == 3:
                result.append({
                    'main'      : decoded[0],
                    'sub'       : decoded[1],
                    'counters'  : decoded[2].split('+')
                })
        return result

    def selectMultiData(self, counters, first=None, last=None):
        result = None
        for counter in self.__decodeCounters(counters):
            result = margeDictList(result, self.selectData(self.__meta.getDatabaseTableName(counter['main'], counter['sub']), counter['counters'], first=first, last=last))
        return result


################################################################################
### Class - Converter
################################################################################
class DbConverter:
    __resource  = None
    __dbfile    = None
    __preserve  = None
    __fp        = None
    __re_date   = re.compile(r"^([0-9]{2})\/([0-9]{2})\/([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$")
    __re_col    = re.compile(r"^([^()]+)\(([^()]+)\)$")

    def __init__(self, csvFile, preserve=True):
        self.__resource = csvFile
        self.__preserve = preserve
        pass

    def __del__(self):
        if self.__fp is not None:
            self.__fp.close()
        if not self.__preserve:
            try:
                os.remove(self.__resource)
            except Exception as e:
                logger.error(e)
        pass

    ### "xxx","yyy",\n -> xxx,yyy
    def __pealLine(self, line):
        return line.replace('\n', '').replace('"', '').strip(',')

    ### MM/DD/YYYY hh:mm:ss -> UTC or YYYYMMDDhhmmss
    def __convertDate(self, date, mode='utc', default='Unknown'):
        match = self.__re_date.match(date)
        if not match:
            return default
        #
        if mode == 'file':
            return '%s%s%s%s%s%s' % (match.groups()[2], match.groups()[0], match.groups()[1], match.groups()[3], match.groups()[4], match.groups()[5])
        else:
            return '%s-%s-%sT%s:%s:%sZ' % (match.groups()[2], match.groups()[0], match.groups()[1], match.groups()[3], match.groups()[4], match.groups()[5])

    def __extractName(self, line):
        return line.split(',')[1].split('\\')[2]

    def __extractDate(self, line, mode='utc', default='Unknown'):
        return self.__convertDate(line.split(',')[0], mode=mode, default=default)

    def __extractColumn(self, col):
        splited = col.split("\\")
        if len(splited) < 5:
            return (None, None, None)
        #
        groups = splited[3]
        counter = splited[4]
        match = self.__re_col.match(groups)
        if match:
            main = match.groups()[0]
            sub  = match.groups()[1]
        else:
            main = groups
            sub  = 'default'
        return (main, sub, counter)

    def __rewind(self, index=0):
        try:
            if self.__fp is not None:
                self.__fp.close()
            self.__fp = open(self.__resource, 'r')
            for i in range(index):
                self.__fp.readline()
        except Exception as e:
            logger.error(e)
            return False
        return True

    def __readline(self):
        try:
            if self.__fp is None:
                self.__fp = open(self.__resource, 'r')
            line = self.__pealLine(self.__fp.readline())
        except Exception as e:
            logger.error(e)
            return None
        return line

    def __readdata(self):
        line = self.__readline()
        if not line:
            return None
        data = line.split(',')
        date = self.__convertDate(data[0], default=None)
        if not date:
            return None
        data[0] = date
        return data

    def createMeta(self):
        if not self.__rewind():
            return False
        #
        titleLine = self.__readline()
        firstLine = lastLine = self.__readline()
        while True:
            line = self.__readline()
            if not line:
                break
            lastLine = line
        #
        name = self.__extractName(titleLine)
        date = self.__extractDate(firstLine, mode='file')
        first = self.__extractDate(firstLine)
        last = self.__extractDate(lastLine)
        #
        columns = {}
        colList = titleLine.split(',')[1:]
        for index, col in enumerate(colList):
            (main, sub, counter) = self.__extractColumn(col)
            if main is None:
                continue
            #
            if main not in list(columns.keys()):
                columns[main] = {}
            if sub not in list(columns[main].keys()):
                columns[main][sub] = {}
            columns[main][sub][counter] = {
                'name'      : counter,
                'index'     : index + 1,
                'average'   : None,
                'variance'  : None
            }
        #
        dirPath = os.path.dirname(self.__resource)
        meta = DbMeta.create(dirPath, name, date, first, last, columns)
        self.__dbfile = os.path.join(dirPath, meta.getResourceName())
        return meta

    def __extractData(self, data, indexes):
        result = list(map(lambda x: '"%s"' % x, data[:1]))
        result.extend(sliceByIndex(data, indexes))
        return result

    def createDatabase(self):
        if self.__dbfile is None:
            self.createMeta()
        database = Database(self.__dbfile + '.db')
        # Create tables
        for main in database.getColumnMainGroups():
            for sub in database.getColumnSubGroups(main):
                database.createTable(database.getDatabaseTableName(main, sub), database.getColumnCounters(main, sub))
        # Insert data into each table
        self.__rewind(index=1)
        while True:
            data = self.__readdata()
            if data is None:
                break
            for main in database.getColumnMainGroups():
                for sub in database.getColumnSubGroups(main):
                    database.insertData(database.getDatabaseTableName(main, sub), database.getColumnCounters(main, sub), self.__extractData(data, database.getColumnCounters(main, sub, key='index')))
        result = database.commit()
        if not result:
            return False
        #
        for main in database.getColumnMainGroups():
            for sub in database.getColumnSubGroups(main):
                counters = database.getColumnCounters(main, sub)
                avgs = database.averageOfData(database.getDatabaseTableName(main, sub), counters)
                vars = database.varianceOfData(database.getDatabaseTableName(main, sub), counters)
                if len(avgs) != len(counters) or len(vars) != len(counters):
                    logger.error(avgs)
                    logger.error(vars)
                    exit(-1)
                for index, counter in enumerate(counters):
                    database.updateColumn(main, sub, counter, 'average', avgs[index])
                    database.updateColumn(main, sub, counter, 'variance', vars[index])
        #
        result = database.update()
        if not result:
            return False
        #
        return database


################################################################################
### Array Tools
################################################################################
def sliceByIndex(valueList, indexList):
    try:
        result = list(map(lambda x: valueList[x], indexList))
    except Exception as e:
        logger.error(e)
        return []
    return result


################################################################################
### Dict Tools
################################################################################
def margeDictList(dictList1, dictList2):
    if dictList1 is None:
        return dictList2
    if dictList2 is None:
        return dictList1
    if len(dictList1) != len(dictList2):
        return []
    #
    result = []
    for index in range(len(dictList1)):
        res = {}
        res.update(dictList1[index])
        res.update(dictList2[index])
        result.append(res)
    return result


def cleanupNestedDict(nestedDict, level=1):
    delKeys = []
    for key in nestedDict:
        if type(nestedDict[key]) is list:
            if len(nestedDict[key]) == 0:
                delKeys.append(key)
        if type(nestedDict[key]) is dict:
            if level > 1:
                cleanupNestedDict(nestedDict[key], level=level-1)
            if len(nestedDict[key]) == 0:
                delKeys.append(key)
    for key in delKeys:
        del nestedDict[key]
    return
