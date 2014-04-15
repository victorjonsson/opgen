import os
import codecs
import pystache
from parser import ContentParser, Utils
from watcher import DirectoryWatcher, FileWatcher
try:
    from Queue import PriorityQueue
except RuntimeError:
    from queue import PriorityQueue


__all__ = ['Generator', 'ContentParser', 'DirectoryWatcher', 'FileWatcher']


class Generator:

    def generate(self, pagedir, templatefile, newfile):           
        html = self._create_new_html(pagedir, Utils.file_content(templatefile))
        newfile_obj = codecs.open(newfile, 'w', encoding='utf-8')
        newfile_obj.write(html)
        newfile_obj.close()
        return html
        
    def _create_new_html(self, pagedir, template_html):
        parser = ContentParser()
        pagefiles = Utils.find_pages(pagedir)
        pagequeue = PriorityQueue()
        numpages = len(pagefiles)
        for pagefile in pagefiles:
            page_obj = parser.file_to_content_dict(pagefile)
            if page_obj['index'].isdigit():
                pagequeue.put([int(page_obj['index']), page_obj])
            else:
                pagequeue.put([numpages, page_obj])
            continue
        return pystache.render(template_html, {'pages':self._page_queue_to_list(pagequeue)})

    def _page_queue_to_list(self, queue):
        pages = []
        while( queue.empty() is False ):
            pages.append( queue.get()[1] )
        return pages