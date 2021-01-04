# NoteApp

NoteApp is a server-less, lightweight and easy-to-use note-taking web app that uses GitHub flavoured Markdown syntax for styling all forms of writing. NoteApp uses an in-browser database called [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store data. 

Features 
------------
- Add / Edit / Delete Notes.
- Copied HTML content automatically converted to Markdown on paste event.
- Syntax highliting for code blocks.
- Download Notes as Markdown files.
- Markdown editing tools.
- Filter/Search notes.
- Auto close brackets and quotes.
- Split screen for Markdown Live Preview
- Emojis!! :fire: :heart_eyes: :star2: :sunglasses: :sparkles: 

Syntax guide
------------

Here’s an overview of Markdown syntax that you can use on NoteApp.

### Headers

To create a heading, add number signs (#) in front of a word or phrase. The number of number signs you use should correspond to the heading level. For example, to create a heading level three (<h3>), use three number signs (e.g., ### My Header).

    # This is an <h1> tag
    ## This is an <h2> tag
    ###### This is an <h6> tag

### Emphasis

You can add emphasis by making text bold or italic.

    *This text will be italic*
    _This will also be italic_
    A*cat*meow
    
    **This text will be bold**
    I just love __bold text__.
    Love**is**bold

### Lists

You can organize items into ordered and unordered lists.

#### Unordered Lists

To create an unordered list, add dashes (-), asterisks (*), or plus signs (+) in front of line items.

     - Item 1
     - Item 2
        * Item 2a
        * Item 2b
        + Item 3a
        + Item 3b
        - Item 4a
        - Item 4b

#### Ordered Lists

To create an ordered list, add line items with numbers followed by periods. The numbers don’t have to be in numerical order, but the list should start with the number one.

    1. Item 1
    1. Item 2
    1. Item 3
       1. Item 3a
       1. Item 3b

The rendered output will look like this:

1. Item 1
1. Item 2
1. Item 3
   1. Item 3a
   1. Item 3b

### Images

Format: `![Alt Text](url)`

    ![GitHub Logo](/images/logo.png)
    Format: ![Alt Text](url)

### Links

Format: `[Link name](url)`

    http://github.com - automatic!
    [GitHub](http://github.com)


To quickly turn a URL or email address into a link, enclose it in angle brackets.

    <https://www.example.org>

    <fake@example.com>

The rendered output looks like this:

<https://www.example.org>

<fake@example.com>

### Blockquotes
To create a blockquote, add a > in front of a paragraph.

    As Kanye West said:
    
    > We're living the future so
    > the present is our past.

The rendered output looks like this:

As Kanye West said:

> We're living the future so
> the present is our past.

Blockquotes can contain other Markdown formatted elements:

    > #### The quarterly results look great!
    >
    > - Revenue was off the chart.
    > - Profits were higher than ever.
    >
    >  *Everything* is going according to **plan**.

The rendered output looks like this:

> #### The quarterly results look great!
> 
> *   Revenue was off the chart.
> *   Profits were higher than ever.
> 
> _Everything_ is going according to **plan**.


### Task Lists

    - [x] a single item in the list
    - [x] list syntax required (any unordered or ordered list supported)
    - [x] this is a complete item
    - [ ] this is an incomplete item

Would become:

- [x] a single item in the list
- [x] list syntax required (any unordered or ordered list supported)
- [x] this is a complete item
- [ ] this is an incomplete item

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

Creating tables with hyphens and pipes can be tedious. To speed up the process, try using the [Markdown Tables Generator](https://www.tablesgenerator.com/markdown_tables). Build a table using the graphical interface, and then copy the generated Markdown-formatted text into your notes.

### Automatic linking for URLs

Any URL (like `http://www.github.com/`) will be automatically converted into a clickable link - [http://www.github.com/](http://www.github.com/)

### Strikethrough

Any word wrapped with two tildes (like `~~this~~`) will appear crossed out - (like ~~this~~).

### Horizontal Rules

To create a horizontal rule, use three or more asterisks (`***`), dashes (`---`), or underscores (`___`) on a line by themselves.

    ***

    ---

    _________________

### Inline code

To denote a word or phrase as code, enclose it in backticks (`).

    I think you should use an `<pre><code>` element here instead.


### Code Blocks

To create code blocks, indent every line of the block by at least four spaces or one tab.

        {
        "firstName": "John",
        "lastName": "Smith",
        "age": 25
        }

If you find that inconvenient, try using fenced code blocks. Depending on your Markdown processor or editor, you’ll use three backticks (```) or three tildes (~~~) on the lines before and after the code block. 

    ```
    {
    "firstName": "John",
    "lastName": "Smith",
    "age": 25
    }
    ```

### Syntax Highlighting

NoteApp uses a Markdown processors that support syntax highlighting for fenced code blocks. This feature attempts to detects the language automatically and adds color highlighting for whatever language your code was written in. 

```
#!/bin/bash

###### CONFIG
ACCEPTED_HOSTS="/root/.hag_accepted.conf"
BE_VERBOSE=false

if [ "$UID" -ne 0 ]
then
 echo "Superuser rights required"
 exit 2
fi

genApacheConf(){
 echo -e "# Host ${HOME_DIR}$1/$2 :"
}

echo '"quoted"' | tr -d \" > text.txt
```

### Markdown Live Preview

Live markdown previews for your favorite editor on a split screen.

### Emoji

NoteApp supports [emojis](https://www.webfx.com/tools/emoji-cheat-sheet/)! There are two ways to add emoji to Markdown files: copy and paste the emoji into your Markdown-formatted text, or type emoji shortcodes.

Emoji shortcuts begin and end with a colon and include the name of an emoji.

```
Gone camping! :tent: Be back soon.

That is so funny! :joy:
```

This will be rendered as:

> Gone camping! :tent: Be back soon.

> That is so funny! :joy:


You can use this [list of emoji shortcodes](https://gist.github.com/rxaviers/7360908)
