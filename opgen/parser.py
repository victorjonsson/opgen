import os


class ContentParser:

    def file_to_content_dict(self, filepath):
        """
        Create a FileContent object out of given file
        
        @param string filepath
        @return: {content, slug, name, label, parent}
        """
        return self.parse_content( Utils.file_content(filepath) )
        
    def parse_content(self, content):
        """
        Create a FileContent object out of given file content
        
        @param string content
        @return: {content, slug, name, label, parent}
        """
        slug = ''
        label = ''
        header = ''
        name = ''
        index = ''
        menu = True
        chunks = content.split('page-ref ')
        if len(chunks) == 2:
            subchunks = chunks[1].split('>')
            content = '>'.join(subchunks[1:]).strip()
            slug = self._parse_attr(subchunks[0], 'slug')
            label = self._parse_attr(subchunks[0], 'label')
            header = self._parse_attr(subchunks[0], 'header')
            menu = self._parse_attr(subchunks[0], 'menu')
            index = self._parse_attr(subchunks[0], 'index')

        if menu == 'false':
            menu = False
        else:
            menu = True

        return {"content": content, "label":label, "name":name,
                "slug":slug, "header":header, "menu":menu, "index":index}
        
    def _parse_attr(self, htmlstring, attr):
        """
        @example: generator._parse_attr('<page-ref attr="value" />', 'attr')
        @return: string
        """
        try:
            return htmlstring.split(attr+'=')[1].lstrip('"\'').split('"')[0].split('\'')[0]
        except IndexError:
            return ''   
    
class Utils:
    
    @staticmethod
    def find_pages(directory):
        """
        Get all html files in given directory
        
        @param string directory
        @return: list
        """
        pages = [];
        directory = directory.rstrip('/') + '/'
        for f in os.listdir(directory):
            if f.endswith(".html") or f.endswith(".htm"):
                pages.append(directory + f)
            continue
        return pages
    
    @staticmethod
    def file_content(filepath):
        """
        Get content of a file as a string
        
        @param string directory
        @return: string
        """
        fileobj = open(filepath, 'r')
        content = fileobj.read()
        fileobj.close()
        return content