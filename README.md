# About NoteApp

NoteApp is a server-less, lightweight and easy-to-use note-taking app that uses GitHub flavoured Markdown syntax for styling all forms of writing on the GitHub platform. NoteApp uses an in-browser database called [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store notes data inside user's browser.

Features 
------------
- Add / Edit / Delete Notes.
- Download Notes as Markdown files.
- Markdown editing tools.
- Filter/Search notes.
- Syntax highliting for code blocks.
- Detect HTML in clipboard content (on paste event) and convert to Markdown.
- Emojis!! :fire: :heart_eyes: :star2: :sunglasses: :sparkles: 

Syntax guide
------------

Here’s an overview of Markdown syntax that you can use on NoteApp.

### Headers

    # This is an <h1> tag
    ## This is an <h2> tag
    ###### This is an <h6> tag

### Emphasis

    *This text will be italic*
    _This will also be italic_
    
    This text will be bold
    This will also be bold

### Lists

#### Unordered

     Item 1
     Item 2
      * Item 2a
      * Item 2b

#### Ordered

    1. Item 1
    1. Item 2
    1. Item 3
       1. Item 3a
       1. Item 3b

### Images

    ![GitHub Logo](/images/logo.png)
    Format: ![Alt Text](url)

### Links

    http://github.com - automatic!
    [GitHub](http://github.com)

### Blockquotes

    As Kanye West said:
    
    > We're living the future so
    > the present is our past.

### Inline code

    I think you should use an
    &lt;addr&gt; element here instead.

### Task Lists

    - [x] @mentions, #refs, [links](), **formatting**, and <del>tags</del> supported
    - [x] list syntax required (any unordered or ordered list supported)
    - [x] this is a complete item
    - [ ] this is an incomplete item

If you include a task list in the first comment of an Issue, you will get a handy progress indicator in your issue list. It also works in Pull Requests!

### Tables

You can create tables by assembling a list of words and dividing them with hyphens `-` (for the first row), and then separating each column with a pipe `|`:

    First Header | Second Header
    ------------ | -------------
    Content from cell 1 | Content from cell 2
    Content in the first column | Content in the second column

Would become:

| First Header | Second Header |
| --- | --- |
| Content from cell 1 | Content from cell 2 |
| Content in the first column | Content in the second column |

### Automatic linking for URLs

Any URL (like `http://www.github.com/`) will be automatically converted into a clickable link.

### Strikethrough

Any word wrapped with two tildes (like `~~this~~`) will appear crossed out.

### Emoji

NoteApp supports [emojis](https://www.webfx.com/tools/emoji-cheat-sheet/)!