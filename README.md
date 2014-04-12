# One-Page Generator

OPgen is a small command line tool that can generate one-page websites (flat file). Organize your pages in separate
files and **OPgen** will collect their content and insert them in your template (index.mustache).

**Example:**<br />http://formvalidator.net/

## Setup

1. Clone this project where suiteable on your server.
2. Run `$ pip install pystache`.
3. That's it! Add your own pages to the pages directory and generate the website by calling `$ python generator.py` in your console.
Use the flag `-w` if you want **OPgen** to automatically generate the website when you make an edit to your project.

## CLI

```
Usage: python generator.py [<flags>]

Options:
  -h, --help           show this help message and exit
  --template=TEMPLATE  File to use as template [index.mustache]
  --file=FILE          Name of the generated file [index.html]
  --pages=PAGES        Directory where the pages are located [pages]
  -w, --watch          Start monitoring file changes and generate the one-page
                       html file on the fly
```


## jQuery Events

Use the event `pageChange` to detect when the visitor has navigated to a new page

```js
$(window).on('pageChange', function(evt, page, args, section) {
    // new page is entered
});
```

The application will change to a "mobile" state when the window width is lower than 400px. Use the event `viewModeChange` to
detect when this happens.

```js
$(window).on('viewModeChange', function(evt, newMode) {
  // new mode will be either 'mobile' or 'desktop'
});
```

Set the js variable `preventViewModeChange` to false if you want to prevent the view-mode change entirely.
