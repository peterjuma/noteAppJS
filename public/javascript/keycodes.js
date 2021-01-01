cblock = `\n\`\`\`\n`;
tbl = 
`column1 | column2 | column3
------- | ------- | -------
column1 | column2 | column3
column1 | column2 | column3
column1 | column2 | column3`;
hline = `----`;

keyCodes = {
    "backquote":{
       "open":"`",
       "close":"`",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "doublequote":{
       "open":"\"",
       "close":"\"",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "singlequote":{
       "open":"\'",
       "close":"\'",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "bold":{
       "open":"**",
       "close":"**",
       "pattern":"",
       "regEx":false,
       "offsetStart":2,
       "offsetEnd":2
    },
    "italic":{
       "open":"_",
       "close":"_",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "strike":{
       "open":"~~",
       "close":"~~",
       "pattern":"",
       "regEx":false,
       "offsetStart":2,
       "offsetEnd":2
    },
    "codeblock":{
       "open": cblock,
       "close": cblock,
       "pattern":"",
       "regEx":false,
       "offsetStart":5,
       "offsetEnd":5
    },
    "brackets":{
       "open":"(",
       "close":")",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "curlybrackets":{
       "open":"{",
       "close":"}",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "squarebrackets":{
       "open":"[",
       "close":"]",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "anglebrackets":{
       "open":"<",
       "close":">",
       "pattern":"",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "link":{
       "open":"",
       "close":"",
       "pattern":"",
       "regEx":false,
       "offsetStart":7,
       "offsetEnd":7
    },
    "image":{
       "open":"",
       "close":"",
       "pattern":"",
       "regEx":false,
       "offsetStart":12,
       "offsetEnd":12
    },
    "table":{
       "open":"",
       "close":"",
       pattern: "\n"+tbl+"\n",
       "regEx":false,
       "offsetStart":1,
       "offsetEnd":1
    },
    "hline":{
       "open":"",
       "close":"",
       pattern: "\n"+hline,
       "regEx":false,
       "offsetStart":"",
       "offsetEnd":""
    },
    "ulist":{
       "open":"",
       "close":"",
       "pattern":"- ",
       "regEx":true,
       "offsetStart":2,
       "offsetEnd":2
    },
    "olist":{
       "open":"",
       "close":"",
       "pattern":"1. ",
       "regEx":true,
       "offsetStart":3,
       "offsetEnd":3
    },
    "tasklist":{
       "open":"",
       "close":"",
       "pattern":"- [ ]",
       "regEx":true,
       "offsetStart":6,
       "offsetEnd":6
    },
    "heading":{
       "open":"",
       "close":"",
       "pattern":"#",
       "regEx":true,
       "offsetStart":2,
       "offsetEnd":2
    },
    "quote":{
       "open":"",
       "close":"",
       "pattern":"> ",
       "regEx":true,
       "offsetStart":2,
       "offsetEnd":2
    },
    "tab":{
       "open":"",
       "close":"",
       "pattern":"\t",
       "regEx":true,
       "offsetStart":"",
       "offsetEnd":""
    }
 }






