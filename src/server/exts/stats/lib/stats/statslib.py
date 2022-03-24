#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = ['extractStatsName', 'convertCsv2Database', 'getStatsCounters', 'getStatsData']
__author__  = 'aumezawa'
__version__ = '0.1.0'


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
    meta = converter.getMeta()
    if meta is None:
        return 'Unknown'
    #
    return meta.getResourceName()


def convertCsv2Database(csvFile, preserve=False):
    converter = DbConverter(csvFile, preserve=preserve)
    meta = converter.getMeta()
    if meta is None:
        return None
    meta.save()
    #
    db = converter.getDatabase()
    if db is None:
        return None
    #
    del converter
    #
    return meta.getResourceName()


def getStatsCounters(dbFile):
    infFile = dbFile.strip('.db') + '.inf'
    meta = DbMeta(infFile)
    meta.load()
    return meta.getColumnAllCounters()


def getStatsData(dbFile, counters, first=None, last=None):
    db = Database(dbFile)
    return db.selectMultiData(counters)


################################################################################
### Class - Meta
################################################################################
class DbMeta:
    __resource  = None
    __name      = None
    __version   = DB_VERSION
    __date      = None
    __first     = None
    __last      = None
    __columns   = None

    def __init__(self, infFile):
        self.__resource = infFile
        pass

    def getWorkingDirectory(self):
        return os.path.dirname(self.__resource)

    def getResourceName(self):
        (base, ext) = os.path.splitext(os.path.basename(self.__resource))
        return base

    def getName(self):
        return self.__name

    def setName(self, name):
        self.__name = name
        return self

    def getVersion(self):
        return self.__version

    def getDate(self):
        return self.__date

    def setDate(self, date):
        self.__date = date
        return self

    def getFirst(self):
        return self.__first

    def setFirst(self, date):
        self.__first = date
        return self

    def getLast(self):
        return self.__last

    def setLast(self, date):
        self.__last = date
        return self

    def getColumns(self):
        return self.__columns

    def getColumns(self, columns):
        self.__columns = columns
        return self

    def getColumnMainGroups(self):
        if self.__columns is None:
            return []
        try:
            result = list(self.__columns.keys())
        except Exception as e:
            logger.error(e)
            return []
        return result

    def getColumnSubGroups(self, main):
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

    def getColumnCounters(self, main, sub, type='name'):
        if self.__columns is None:
            return []
        if main not in self.getColumnMainGroups() or sub not in self.getColumnSubGroups(main):
            return []
        try:
            result = list(map(lambda x: x[type], self.__columns[main][sub]))
        except Exception as e:
            logger.error(e)
            return []
        return result

    def getColumnAllCounters(self):
        if self.__columns is None:
            return []
        try:
            result = {
                main: {
                    sub: list(map(lambda x: x['name'], counter)) for (sub, counter) in subs.items()
                } for (main, subs) in self.__columns.items()
            }
        except Exception as e:
            logger.error(e)
            return []
        return result

    def save(self):
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

    def load(self):
        try:
            with open(self.__resource, 'r') as fp:
                meta = json.load(fp)
                self.__name     = meta['name']
                self.__version  = meta['version']
                self.__date     = meta['date']
                self.__columns  = meta['columns']
                self.__first    = meta['first']
                self.__last     = meta['last']
        except Exception as e:
            logger.error(e)
            return None
        return self


################################################################################
### Class - Converter
################################################################################
class DbConverter:
    __resource  = None
    __meta      = None
    __database  = None
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
        if self.__database is not None:
            del self.__database
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
    def __convertDate(self, date, mode='utc'):
        match = self.__re_date.match(date)
        if match:
            if mode == 'file':
                return '%s%s%s%s%s%s' % (match.groups()[2], match.groups()[0], match.groups()[1], match.groups()[3], match.groups()[4], match.groups()[5])
            else:
                return '%s-%s-%sT%s:%s:%sZ' % (match.groups()[2], match.groups()[0], match.groups()[1], match.groups()[3], match.groups()[4], match.groups()[5])
        return 'Unknown'

    def __extractName(self, line):
        return line.split(',')[1].split('\\')[2]

    def __extractDate(self, line, mode='utc'):
        return self.__convertDate(line.split(',')[0], mode=mode)

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
            return self.__pealLine(self.__fp.readline())
        except Exception as e:
            logger.error(e)
            return None

    def __readdata(self):
        line = self.__readline()
        if not line:
            return None
        data = line.split(',')
        date = self.__convertDate(data[0])
        if date == 'Unknown':
            return None
        data[0] = date
        return data

    def __createMeta(self):
        self.__rewind()
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
        for idx, col in enumerate(colList):
            (main, sub, counter) = self.__extractColumn(col)
            if main is None:
                return False
            #
            if main not in list(columns.keys()):
                columns[main] = {}
            if sub not in list(columns[main].keys()):
                columns[main][sub] = []
            columns[main][sub].append({
                'index' : idx + 1,
                'name'  : counter
            })
        #
        dirPath = os.path.dirname(self.__resource)
        self.__meta = DbMeta(os.path.join(dirPath, '%s_%s_%s.inf' % (name, date, DB_VERSION)))
        self.__meta.setName(name)
        self.__meta.setDate(date)
        self.__meta.setFirst(first)
        self.__meta.setLast(last)
        self.__meta.getColumns(columns)
        return True

    def getMeta(self):
        if self.__meta is None:
            self.__createMeta()
        return self.__meta

    def __getDababaseTableName(self, main, sub):
        if sub == 'default':
            return main
        else:
            return '%s(%s)' % (main, sub)

    def __extractData(self, data, indexes):
        try:
            result = list(map(lambda x: '"%s"' % x, data[:1]))
            result.extend(list(map(lambda x: data[x], indexes)))
        except Exception as e:
            logger.error(e)
            return []
        return result

    def __initDatabase(self):
        dbFile = os.path.join(self.__meta.getWorkingDirectory(), self.__meta.getResourceName() + '.db')
        self.__database = Database(dbFile)
        # Create tables
        for main in self.__meta.getColumnMainGroups():
            for sub in self.__meta.getColumnSubGroups(main):
                self.__database.createTable(self.__getDababaseTableName(main, sub), self.__meta.getColumnCounters(main, sub))
        result = self.__database.commit()
        if not result:
            self.__database.close()
            self.__database = None
            return False
        # Insert data into each table
        self.__rewind(index=1)
        while True:
            data = self.__readdata()
            if data is None:
                break
            for main in self.__meta.getColumnMainGroups():
                for sub in self.__meta.getColumnSubGroups(main):
                    self.__database.insertData(self.__getDababaseTableName(main, sub), self.__meta.getColumnCounters(main, sub), self.__extractData(data, self.__meta.getColumnCounters(main, sub, type='index')))
        result = self.__database.commit()
        if not result:
            self.__database.close()
            self.__database = None
            return False
        #
        return True

    def getDatabase(self):
        if self.__database is None:
            self.__initDatabase()
        return self.__database


################################################################################
### Class - Database
################################################################################
class Database:
    __resouce   = None
    __date      = None
    __db        = None
    __cursor    = None

    def __init__(self, dbFile, date=True):
        self.__resouce = dbFile
        self.__date = date
        self.__connect()
        pass

    def __del__(self):
        if self.__db is None:
            pass
        try:
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

    def createTable(self, table, cols):
        if self.__db is None or self.__cursor is None:
            return False
        #
        columns = ','.join(list(map(lambda x: '"%s" NUMERIC' % (x), cols)))
        try:
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
        columns = ','.join(list(map(lambda x: '"%s"' % (x), cols)))
        values = ','.join(data)
        try:
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
        columns = ','.join(list(map(lambda x: '"%s"' % (x), cols)))
        try:
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

    def __getDababaseTableName(self, main, sub):
        if sub == 'default':
            return main
        else:
            return '%s(%s)' % (main, sub)

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

    def __mergeData(self, base, append):
        if base is None:
            return append
        if append is None:
            return base
        if len(base) != len(append):
            return None
        #
        result = []
        for index in range(len(base)):
            res = {}
            res.update(base[index])
            res.update(append[index])
            result.append(res)
        return result

    def selectMultiData(self, counters, first=None, last=None):
        result = None
        for counter in self.__decodeCounters(counters):
            result = self.__mergeData(result, self.selectData(self.__getDababaseTableName(counter['main'], counter['sub']), counter['counters'], first=first, last=last))
        return result
