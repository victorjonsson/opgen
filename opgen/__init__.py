import os
import pystache
from parser import ContentParser, Utils
from watcher import DirectoryWatcher, FileWatcher

__all__ = ['Generator', 'ContentParser', 'Utils', 'DirectoryWatcher', 'FileWatcher']


class Generator:

    def generate(self, pagedir, templatefile, newfile):           
        html = self._create_new_html(pagedir, Utils.file_content(templatefile))
        newfile_obj = open(newfile, 'w')
        newfile_obj.write(html)
        newfile_obj.close()
        return html
        
    def _create_new_html(self, pagedir, template_html):
        parser = ContentParser()
        pagefiles = Utils.find_pages(pagedir)
        pages = []
        for pagefile in pagefiles:
            page_obj = parser.file_to_content_dict(pagefile)
            pages.append(page_obj)
            continue
        return pystache.render(template_html, {'pages':pages})    
