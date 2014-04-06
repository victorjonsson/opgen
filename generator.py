#!/usr/bin/env python

import optparse
import os
import time

from opgen import Generator, DirectoryWatcher, FileWatcher

parser = optparse.OptionParser(usage='%prog [<flags>]')

parser.add_option('--template', default='_index.html',
                  help='File to use as template [%default]')
parser.add_option('--file', default='index.html',
                  help='Name of the generated file [%default]')
parser.add_option('--pages', default='pages',
                  help='Directory where the pages are located [%default]')

parser.add_option("-w", '--watch', action="store_true", dest="watch", help='Start monitoring file changes and generate the one-page html file on the fly')

options, args = parser.parse_args()
generator = Generator()
dirpath = os.path.dirname(os.path.realpath(__file__))

generator.generate(dirpath+'/'+options.pages, dirpath+'/'+options.template, dirpath+'/'+options.file);
print '* Generated "%s" using "%s" as template and the pages found in the directory "%s"' % (options.file, options.template, options.pages)

if options.watch:
    print 'Starting to watch for changes made to %s and the directory "%s"....' % (options.template, options.pages)
    dirwatcher = DirectoryWatcher(dirpath+'/'+options.pages)
    filewatch = FileWatcher(dirpath+'/'+options.template)
    while(True):
        if filewatch.has_changed() or dirwatcher.detect_change() :
            print '* change detected, will re-generate %s' % (options.file)
            generator.generate(dirpath+'/'+options.pages, dirpath+'/'+options.template, dirpath+'/'+options.file)
        time.sleep(0.5)
