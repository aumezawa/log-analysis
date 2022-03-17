#!/usr/bin/env python

# TODO: Description
###

from __future__ import print_function

__all__     = ['GetReportObject']
__author__  = 'aumezawa'
__version__ = '0.1.0'


################################################################################
### Required Modules
################################################################################
import logging
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
### Global
################################################################################
FailureCount = 0


################################################################################
### External Functions
################################################################################
def GetReportObject(hostInfo, vmInfos):
    content = Content()
    content.addNewLine()
    content.addText('Tool:')
    table_ver = Table()
    table_ver.addRow(('Report Format Version', None, __version__, None))
    content.addTable(table_ver)
    #
    content.addNewLine()
    content.addText('Environment:')
    table_env = Table()
    table_env.addRow(('Host Name', None, hostInfo['hostname'], None))
    table_env.addIndent('ESXi Base Information')
    table_env.addRow(('Version',                hostInfo['version'],                        None))
    table_env.addRow(('Build',                  hostInfo['build'],                          None))
    table_env.addRow(('Profile',                hostInfo['profile'],                        None))
    table_env.delIndent()
    table_env.addIndent('Hardware Information')
    table_env.addRow(('Machine',                hostInfo['hardware']['machine'],            None))
    table_env.addRow(('Serial Number',          hostInfo['hardware']['serial'],             None))
    table_env.addRow(('BIOS Version',           hostInfo['hardware']['bios'],               None))
    table_env.addRow(('CPU Model',              hostInfo['hardware']['cpu']['model'],       None))
    table_env.addRow(('# of CPU Sockets',       hostInfo['hardware']['cpu']['sockets'],     None))
    table_env.addRow(('# of CPU Cores',         hostInfo['hardware']['cpu']['cores'],       None))
    table_env.addRow(('HyperThreading Enable',  hostInfo['hardware']['cpu']['htEnable'],    None))
    table_env.addRow(('Memory',                 '%d GB' % hostInfo['hardware']['memory'],   None))
    table_env.addRow(('# of NUMA Nodes',        hostInfo['hardware']['numa'],               None))
    for card in hostInfo['hardware']['cards']:
        table_env.addRow(('PCI Slot %d' % card['slot'],     card['device'],                 None))
    table_env.delIndent()
    content.addTable(table_env)
    #
    content.addNewLine()
    content.addText('Check Result:')
    table_chk = Table()
    table_chk.addIndent('System')
    table_chk.addRow(('Power Policy',           hostInfo['system']['powerPolicy'],          lambda x: x == 'High Performance'))
    table_chk.addRow(('Syslog Server',          hostInfo['log']['server'],                  lambda x: x != '<none>'))
    for ntp in hostInfo['date']['ntp']:
        table_chk.addRow(('NTP Server',         ntp['remote'],                              lambda x: x != 'n/a'))
        table_chk.addRow(('NTP Status',         ntp['status'],                              lambda x: ('*' in x) or ('+' in x)))
    table_chk.delIndent()
    table_chk.addIndent('Kernel Parameter')
    table_chk.addRow(('nmiAction',              hostInfo['system']['nmiAction'],            lambda x: x == 0))
    table_chk.delIndent()
    content.addTable(table_chk)
    #
    content.addSummary('Summary: %d failures found.' % FailureCount)
    return content.export()


################################################################################
### Internal Classes/Functions
################################################################################
NEWLINE = ' '
BLANK   = ''

class Content:
    def __init__(self):
        self.contents = []
        self.summary = 0
        return

    def export(self):
        #return [item.export() for item in self.contents]
        return self.contents

    def addNewLine(self):
        #self.contents.append(Text(NEWLINE))
        self.contents.append(Text(NEWLINE).export())
        return self

    def addSummary(self, text):
        #self.contents.insert(0, Text(text))
        self.contents.insert(self.summary, Text(text).export())
        self.summary = self.summary + 1
        return self

    def addText(self, text):
        #self.contents.append(Text(text))
        self.contents.append(Text(text).export())
        return self

    def addTable(self, table):
        if isinstance(table, Table):
            #self.contents.append(table)
            self.contents.append(table.export())
        return self


class Text:
    def __init__(self, text):
        if isinstance(text, Text):
            self.obj = text.export()
        elif isinstance(text, str):
            self.obj = {'text': text}
        else:
            self.obj = {'text': str(text)}
        return

    def export(self):
        return self.obj

    def color(self, color):
        self.obj['color'] = color
        return self

    def bold(self, value=True):
        self.obj['bold'] = value
        return self

    def italics(self, value=True):
        self.obj['italics'] = value
        return self

    def colSpan(self, span):
        if span > 1:
            self.obj['colSpan'] = span
        return self

    def rowSpan(self, span):
        if span > 1:
            self.obj['rowSpan'] = span
        return self


class Table:
    def __init__(self, cols=4):
        self.body = []
        self.cols = cols if cols >= 3 else 4
        self.indents = []
        return

    def export(self):
        return {
            'table': {
                'widths': ['*' for i in range(self.cols)],
                'body'  : [row.export() for row in self.body]
            }
        }

    def addRow(self, values):
        cols = self.cols - len(self.indents)
        if len(values) == cols:
            row = TableRow()
            #
            colSpan = 1
            for i in reversed(range(cols - 2)):
                item = values[i]
                if item is None:
                    row.insert(BLANK)
                    colSpan = colSpan + 1
                    continue
                row.insert(item, colSpan=colSpan)
                if colSpan > 1:
                    colSpan = 1
            #
            value = values[cols - 2]
            expect = values[cols - 1]
            if expect is not None:
                global FailureCount
                if expect(value):
                    jadge = Text('passed').color('green').bold()
                else:
                    jadge = Text('failed').color('red').bold()
                    FailureCount = FailureCount + 1
                row.append(value).append(jadge)
            else:
                row.append(value, colSpan=2).append(BLANK)
            #
            for indent in reversed(self.indents):
                row.insert(indent.intoRow())
            #
            self.body.append(row)
        return self

    def addIndent(self, item):
        if len(self.indents) < self.cols - 3:
            self.indents.append(TableIndent(item))
        return self

    def delIndent(self):
        if len(self.indents) > 0:
            self.indents.pop()
        return self


class TableRow:
    def __init__(self):
        self.obj = []
        return

    def export(self):
        return [item.export() for item in self.obj]

    def append(self, item, colSpan=1):
        if isinstance(item, TableIndent):
            self.obj.append(item)
        else:
            self.obj.append(Text(item).colSpan(colSpan))
        return self

    def insert(self, item, colSpan=1):
        if isinstance(item, TableIndent):
            self.obj.insert(0, item)
        else:
            self.obj.insert(0, Text(item).colSpan(colSpan))
        return self


class TableIndent:
    def __init__(self, text):
        self.text = Text(text)
        self.rows = 0
        self.first = True
        return

    def export(self):
        if self.first:
            self.first = False
            return self.text.rowSpan(self.rows).export()
        else:
            return Text(BLANK).export()

    def intoRow(self):
        self.rows = self.rows + 1
        return self
