# One-Page Generator

OPgen is a small command line tool that can generate one-page websites (flat file). Organize your pages in separate files and **opgen** will collect their content and insert them in your template (_index.html).

**Example:**<br />http://formvalidator.net/

## Setup

1. Clone this project where suiteable on your server
2. Run `$ pip install pystache`
3. That's it! Add your own pages to the pages directory and generate the website by calling `$ python generator.py` in your console. Use the flag `-w` if you want **opgen** to automatically genereate the website when you save page.

## CLI

```
Usage: generator.py [<flags>]

Options:
  -h, --help           show this help message and exit
  --template=TEMPLATE  File to use as template [_index.html]
  --file=FILE          Name of the generated file [index.html]
  --pages=PAGES        Directory where the pages are located [pages]
  -w, --watch          Start monitoring file changes and generate the one-page
                       html file on the fly
```
