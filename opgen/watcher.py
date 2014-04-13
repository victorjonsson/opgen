import hashlib

from parser import Utils

class DirectoryWatcher:
    
    def __init__(self, directory):
        self.directory = directory
        self.files = {}
        self.detect_change()       
                
    def detect_change(self):
        changed = False
        for path in Utils.find_pages(self.directory):
            if path in self.files:
                if self.files[path].has_changed():
                    changed = True
            else:
                changed = True
                self.files[path] = FileWatcher(path)
            continue
        return changed
    
class FileWatcher:
    
    def __init__(self, filepath):
        self.path = filepath
        self.checksum = ''
        self.has_changed() # generate checksum
        
    def has_changed(self):
        new_checksum = hashlib.md5( Utils.file_content(self.path, 'ascii') ).hexdigest()
        changed = self.checksum != new_checksum
        self.checksum = new_checksum
        return changed