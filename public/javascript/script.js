// Turndown
var turndownService = new TurndownService();
var gfm = turndownPluginGfm.gfm
var tsklst = turndownPluginGfm.taskListItems
turndownService.use(gfm)
turndownService.use(tsklst)

// Markdown-It
var md = new window.markdownit()
md.use(window.markdownitEmoji);

// Task List
md.use(window.markdownitTaskLists)

// Get the elements with class="column"
var elements = document.getElementsByClassName("column");
var e = document.createElement("base");
e.target = "_blank";
document.head.appendChild(e);

// Declare a loop variable
var i;

// List View
function listView() {

    for (i = 0; i < elements.length; i++) {
        elements[i].style.width = "100%";
    }
}
// Grid View
function gridView() {
    for (i = 0; i < elements.length; i++) {
        elements[i].style.width = "50%";
    }
}

// Toggle note highlighting
var container = document.getElementById("btnContainer");
document.addEventListener('DOMContentLoaded', toggleActive());
function toggleActive() {
    let btns=document.querySelectorAll('.btn');
    btns.forEach(function(btn) {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
    });
}

class Notes {
    constructor(dbName) {
        this.dbName = dbName;
        if (!window.indexedDB) {
            window.alert("Your browser doesn't support a stable version of IndexedDB. \
        Such and such feature will not be available.");
        }
    }
    initialLoad = () => {
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = (event) => {
            console.log('initialLoad - Database error: ', event.target.error.code,
                " - ", event.target.error.message);
        };
        request.onupgradeneeded = (event) => {
            console.log('Populating customers...');
            const db = event.target.result;
            const objectStore = db.createObjectStore('notes', { keyPath: 'noteid' });
            objectStore.onerror = (event) => {
                console.log('initialLoad - objectStore error: ', event.target.error.code,
                    " - ", event.target.error.message);
            };
            // Create an index to search
            objectStore.createIndex('title', 'title', { unique: false });
            objectStore.createIndex('body', 'body', { unique: false });
            objectStore.createIndex('noteid', 'noteid', { unique: true });
            objectStore.createIndex('created_at', 'created_at', { unique: true });
            objectStore.createIndex('updated_at', 'updated_at', { unique: true });
            db.close();
        };
    }
}

var DBNAME = "notesdb"
var load = document.getElementById("load")

const loadDB = () => {
    console.log('Load the Notes database');
    let notes = new Notes(DBNAME);
    notes.initialLoad();
}

// clear.addEventListener("click", deleteDB)
function deleteDB() {
    var req = indexedDB.deleteDatabase(DBNAME);
    window.location.reload();
    req.onsuccess = function () {
        console.log("Deleted database successfully");
    };
    req.onerror = function () {
        console.log("Couldn't delete database");
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}

// Embedded video
var html5medialPlugin = window.markdownitHTML5Embed;
md.use(html5medialPlugin, { 
        html5embed: { useLinkSyntax: true, useImageSyntax: true, 
            attributes: {
            'audio': 'width="33%" controls class="audioplayer"',
            'video': 'width="33%" height="auto" class="audioplayer" controls' },
            is_allowed_mime_type: function(mimetype) {
                var v = document.createElement(mimetype[1]);
                return v.canPlayType && v.canPlayType(mimetype[0]) !== ''; }
        } 
    });

/* Load Data */
var notesGrid = document.getElementById("notes")
const queryDB = () => {
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readonly")
        var cust = tx.objectStore("notes")
        var request = cust.openCursor()
        request.onsuccess = (e) => {
            var cursor = e.target.result            
            if (cursor) {
                html = `<button class="column note" id="${cursor.key}" onclick='showNote(this)'>
                            <input type="checkbox" id="check" name="checked" value='${cursor.key}' onclick="event.stopPropagation();" autocomplete="off">
                            <label for="checked"> ${cursor.value.title}</label><br><br>
                        </button>`;
                notesGrid.innerHTML += html;
                noteSelect() 
                cursor.continue()
            }
        }
    }
}

window.onload = function() {
    setTimeout(loadAfterTime, 100)
 }; 

 // Fetch and read the README.md file
 function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                welcomebody = allText;
            }
        }
    }
    rawFile.send(null);
}


let btnAction = document.getElementsByClassName("btnnote")
var editBox = document.getElementById("editor")

// Display the README.md file contents on demand
function loadHome() {
    readTextFile("README.md");
    html = `
    <div class="shwBtnsR">
    </div>
    <div class="shownote markdown-body" id="editpad">
        <div id="noteHtml">
            <div class="notebody" id="notebody">${md.render(welcomebody)}</div>
        </div>
    </div>`
    editBox.style.display = "unset"
    editBox.innerHTML = html;
    var noteList = document.querySelectorAll(".note");
    if(noteList.length > 0) {
        noteList.forEach(b => b.classList.remove('highlight'));
    }

    setTimeout(function(){
        // Highlight JS
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
            });
    }, 20); 
}

// Display README.md contents if there are no notes else display the first note
 function loadAfterTime(){
    var notes = document.getElementsByClassName('note')
    if(notes[0]) {
        notes[0].click() 
    } else {
        loadHome() 
    }
 }

document.getElementById("homeBtn").addEventListener('click', loadHome);

// Show note when grid box clicked
function showNote(notediv){
    var noteid = notediv.id || notediv.name || notediv
    // Highlight note when clicked
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readonly")
        var store = tx.objectStore("notes")
        var index = store.index("noteid");       
        var request = index.get(noteid);
        request.onsuccess = (e) => {
            var matching = request.result;
            if (matching) {
                html = `
                <div class="shwBtns">
                    <button class="btn" onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" onMouseOut="this.style.color='#444'" onMouseOver="this.style.color='white'"><i class="fa fa-edit fa-lg"></i></button>
                    <button class="btn" id="copy"  onclick="copyMarkdown()"><i class="fas fa-copy fa-lg"></i></button>
                    <button class="btn" id="dwld"  onclick="downloadFile()"><i class="fas fa-download fa-lg"></i></button>
                    <button class="btn" onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" onMouseOut="this.style.color='#444'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                </div>
                <div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                    <div id="noteHtml">
                        <h1 class="notehead" id="title">${matching.title}</h1>
                        <div class="notebody" id="notebody">${md.render(matching.body)}</div>
                    </div>
                </div>`
                editBox.style.display = "unset"
                editBox.innerHTML = html;
            } else{}
        }
        setTimeout(function(){
            // Highlight JS
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
                });
        }, 50); 
    } 
}

function noteSelect(){
    var noteList = document.querySelectorAll(".note");
    for (var i = 0; i < noteList.length; i++) {
        noteList[i].addEventListener("click", function () {
            noteList.forEach(b => b.classList.remove('highlight'));
            this.classList.add('highlight')
        });
    }
}

// Add new Note
var editPad = document.getElementById("editpad")
var newNote = document.getElementById("addBtn")
newNote.addEventListener("click", () => {
        html = `<div name="" class="editnote" id="editpad" contenteditable="false">
                    <input name="title" type="text" id="title" placeholder="Title" autocomplete="off">
                    <div class="md-editor-tools" id="mdtools">
                        <button class="md-buttons md-icon" data-tooltip="Bold" data-handler="bold" id="btnBold"><i class="fas fa-bold"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Italic" data-handler="italic" id="btnItalic"><i class="fas fa-italic"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Header" data-handler="heading" id="btnHeading"><i class="fas fa-heading"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Link" data-handler="link" id="btnLink"><i class="fas fa-link"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Ordered List" data-handler="olist" id="btnOList"><i class="fas fa-list-ol"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Unordered List" data-handler="ulist" id="btnUList"><i class="fas fa-list"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Quote" data-handler="quote" id="btnQuote"><i class="fas fa-quote-left"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Image" data-handler="image" id="btnImage"><i class="far fa-image fa-lg"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Inline Code" data-handler="backquote" id="btnCode"><i class="fas fa-terminal"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Fenced Code" data-handler="codeblock" id="btnCodeBlock"><i class="fas fa-code"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Task List" data-handler="tasklist" id="btnTask"><i class="fas fa-check-square"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Table" data-handler="table" id="btnTable"><i class="fas fa-table"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Strikethrough" data-handler="strike" id="btnStrike"><i class="fas fa-strikethrough"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Horizontal Line" data-handler="hline" id="btnHline"><span style='font-size:16px;'>&mdash;</span></button>
                        <div class="specialBtns">
                            <button class="md-buttons" data-handler="preview" data-tooltip="Preview" id="previewBtn" onclick="fullScreenPreview()"><i class="fas fa-eye fa-lg"></i></button>
                            <button class="md-buttons" data-tooltip="Split Screen"  onclick="splitScreenPreview()" id="splitScreen"><i class="fas fa-columns fa-lg"></i></button>
                        </div>
                    </div>
                    <div class="md-preview" id="md-preview">
                    </div> 
                    <div class="md-editor" id="md-editor">
                        <textarea name="notebody" id="notebody" placeholder="Note"></textarea>
                    </div> 
                </div>
                    <div class="shwBtnsR">
                    <button class="btn" id="saveBtn" onclick="save()" ><i class="fas fa-save fa-lg"></i></button>
                    <button class="btn" id="cancelEdit" onclick='cancelEdit("")' ><i class="fas fa-window-close fa-lg"></i></button>
                 </div>`
    editBox.innerHTML = html;
    document.getElementById("editor").style.display = "unset"
    document.getElementById("notebody").addEventListener('paste', handlePaste);
    document.getElementById('notebody').addEventListener('keydown', handleKey);
    document.getElementById('notebody').addEventListener('input', function(){ textAreaContent("notebody", "saveBtn") });
    document.getElementById('notebody').addEventListener('input', function(){ textAreaContent("notebody", "previewBtn") });
    document.querySelectorAll('.md-icon').forEach(item => {
        item.addEventListener('click', function(e){
            // console.log(this.dataset.handler)
            processInput(this.dataset.handler) 
          })
    })
    var buttons = document.getElementById("notes").getElementsByTagName('button');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].disabled = true;
    }
    document.getElementById("title").focus();
    document.getElementById("saveBtn").disabled = true;
    document.getElementById("addBtn").disabled = true;
    document.getElementById("homeBtn").disabled = true;
})

function textAreaContent(txtId, btnId) {
    if(document.getElementById(txtId).value==="") { 
            document.getElementById(btnId).disabled = true;
       } else { 
            document.getElementById(btnId).disabled = false;
       }
       if(splitPreviewClicked) {
            document.getElementById("previewBtn").disabled = true;
       }
   }

// Delete single note by noteid
function deleteNote(notediv) {
    var noteid = notediv.name || notediv;
    document.getElementById(noteid).style.display = "none"
    editBox.innerHTML = "";
    // console.log(noteid)
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readwrite")
        var store = tx.objectStore("notes")
        store.delete(noteid);
        tx.oncomplete = function () {}
    }
}

// Caption - created date
function countDown(epoch_timestamp) {
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var distance = now - epoch_timestamp * 1000;
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    dateJson = {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    }
    return dateJson
}

// Save / Add New Note
function save() {
    var noteTitle = document.getElementById("title").value
    var noteText = document.getElementById("notebody").value
    var id = Math.round(Date.now() / 1000)  
    const note = {
        noteid: id.toString(),
        title: noteTitle,
        body: noteText,
        created_at: id.toString(),
        updated_at: id.toString()
    };
    addNote(note)
}

// Add single note to the database
function addNote(note) {
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readwrite")
        var store = tx.objectStore("notes")
        store.add(note);
        tx.oncomplete = function () {
            getNote(note.noteid)
        }
    }  
    setTimeout(function(){
        document.getElementById(note.noteid).click()
   }, 200); //wait for atleast  200 ms before click action
   document.getElementById("addBtn").disabled = false;
   document.getElementById("homeBtn").disabled = false;
   var buttons = document.getElementById("notes").getElementsByTagName('button');
   for(var i = 0; i < buttons.length; i++){
       buttons[i].disabled = false;
   }
}

// Get updated values from the UI and generate a JSON object
function update(editdiv) {
    var id = editdiv.name
    var noteTitle = document.getElementById("title").value
    var noteBody = document.getElementById("notebody").value
    var updated_at = Math.round(Date.now() / 1000)  
    const note = {
        noteid: id.toString(),
        title: noteTitle,
        body: noteBody,
        created_at: id.toString(),
        updated_at: updated_at.toString()
    };
    updateNote(note)
}

// Update note in the database
function updateNote(note) {
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readwrite")
        var store = tx.objectStore("notes")
        store.put(note);
        tx.oncomplete = function () {
            showNote(note.noteid)
        }
    }
    document.getElementById("addBtn").disabled = false;
    document.getElementById("homeBtn").disabled = false;
    var buttons = document.getElementById("notes").getElementsByTagName('button');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].disabled = false;
    }
}

// Cancel current note-edit
function cancelEdit(noteid){
    document.getElementById("editor").style.display = "none"
    document.getElementById("addBtn").disabled = false;
    document.getElementById("homeBtn").disabled = false;
    var buttons = document.getElementById("notes").getElementsByTagName('button');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].disabled = false;
    }
    document.getElementById("title").remove();
    document.getElementById("notebody").remove();
    document.getElementById("mdtools").remove();
    document.getElementById("md-editor").remove();
    if(noteid.name !== "undefined"){
        showNote(noteid.name)
    }
}
// Get single note to display in the list and details areas
function getNote(noteid) {
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readonly")
        var store = tx.objectStore("notes")
        var index = store.index("noteid");
        var request = index.get(noteid);
        request.onsuccess = (e) => {
            var matching = request.result;
            if (matching) {
                notesGrid.innerHTML = "";
                var html = `
                <div class="shwBtns">
                    <button class="btn" onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" onMouseOut="this.style.color='#444'" onMouseOver="this.style.color='white'"><i class="fa fa-edit"></i></button>
                    <button class="btn" id="copy"  onclick="copyMarkdown()"><i class="fas fa-copy"></i></button>
                    <button class="btn" id="dwld"  onclick="downloadFile()"><i class="fas fa-download"></i></button>
                    <button class="btn" onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" onMouseOut="this.style.color='#444'" onMouseOver="this.style.color='red'"><i class="fa fa-trash"></i></button>
                </div>
                    <div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                        <div id="noteHtml">
                            <h1 class="notehead" id="title">${matching.title}</h1>
                            <div class="notebody" id="notebody">${md.render(matching.body)}</div>
                        </div>
                    </div>`
                editBox.innerHTML = html;
            } 
        }
    }
    queryDB()
}
// Get single note for editing
var btnStatus = true;
function editNote(notediv) {
    var noteid = notediv.name;
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readonly")
        var store = tx.objectStore("notes")
        var index = store.index("noteid");
        var request = index.get(noteid);
        request.onsuccess = (e) => {
            var matching = request.result;
            if (matching) {
                html = `
                <div name="" class="editnote" id="editpad" contenteditable="false">
                    <input name="title" type="text" id="title" placeholder="Title" autocomplete="off">
                    <div class="md-editor-tools" id="mdtools">
                        <button class="md-buttons md-icon" data-tooltip="Bold" data-handler="bold" data-tooltip="Bold" id="btnBold"><i class="fas fa-bold"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Italic" data-handler="italic" id="btnItalic"><i class="fas fa-italic"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Header" data-handler="heading" id="btnHeading"><i class="fas fa-heading"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Link" data-handler="link" id="btnLink"><i class="fas fa-link"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Ordered List" data-handler="olist" id="btnOList"><i class="fas fa-list-ol"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Unordered List" data-handler="ulist" id="btnUList"><i class="fas fa-list"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Quote" data-handler="quote" id="btnQuote"><i class="fas fa-quote-left"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Image" data-handler="image" id="btnImage"><i class="far fa-image fa-lg"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Inline Code" data-handler="backquote" id="btnCode"><i class="fas fa-terminal"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Fenced Code" data-handler="codeblock" id="btnCodeBlock"><i class="fas fa-code"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Task List" data-handler="tasklist" id="btnTask"><i class="fas fa-check-square"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Table" data-handler="table" id="btnTable"><i class="fas fa-table"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Strikethrough" data-handler="strike" id="btnStrike"><i class="fas fa-strikethrough"></i></button>
                        <button class="md-buttons md-icon" data-tooltip="Horizontal Line" data-handler="hline" id="btnHline"><span style='font-size:16px;'>&mdash;</span></button>
                        <div class="specialBtns">
                            <button class="md-buttons" data-handler="preview" data-tooltip="Preview" id="previewBtn" onclick="fullScreenPreview()"><i class="fas fa-eye fa-lg"></i></button>
                            <button class="md-buttons" data-tooltip="Split Screen"  onclick="splitScreenPreview()" id="splitScreen"><i class="fas fa-columns fa-lg"></i></button>
                        </div>
                    </div>
                    <div class="md-preview" id="md-preview">
                    </div> 
                    <div class="md-editor" id="md-editor">
                        <textarea name="notebody" id="notebody" class="notebody" placeholder="Note"></textarea>
                    </div> 
                </div>
                <div class="shwBtnsR">
                    <button class="btn" id="saveBtn" onclick='update(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" ><i class="fa fa-save fa-lg" aria-hidden="true"></i></button>
                    <button class="btn" id="cancelEdit" onclick='cancelEdit(this)' name="${matching.noteid}" ><i class="fas fa-window-close fa-lg"></i></button>
                </div>`
                editBox.innerHTML = html;
                document.getElementById("title").value = turndownService.turndown(marked(matching.title));
                document.getElementById("notebody").value = turndownService.turndown(marked(matching.body));
                document.getElementById("editor").style.display = "unset"
                document.getElementById("notebody").addEventListener('paste', handlePaste);
                document.getElementById('notebody').addEventListener('keydown', handleKey);
                document.querySelectorAll('.md-icon').forEach(item => {
                    item.addEventListener('click', function(e){
                        // console.log(this.dataset.handler)
                        processInput(this.dataset.handler) 
                    })
                })
                var buttons = document.getElementById("notes").getElementsByTagName('button');
                for(var i = 0; i < buttons.length; i++){
                    buttons[i].disabled = true;
                }
                document.getElementById('notebody').addEventListener('paste', enableSaveBtn, false)
                document.getElementById('notebody').addEventListener('input', enableSaveBtn, false)
                document.getElementById('notebody').addEventListener('propertychange', enableSaveBtn, false)
                document.getElementById('notebody').addEventListener('input', function(){ textAreaContent("notebody", "previewBtn") });
                function enableSaveBtn(event) {
                    document.getElementById("saveBtn").disabled = false;
                    btnStatus = false
                }
                document.getElementById("saveBtn").disabled = true;
                document.getElementById("addBtn").disabled = true;
                document.getElementById("homeBtn").disabled = true;
            } else { }
        }
    }
}

// Markdown preview in full screen mode
var fullPreviewClicked = false;
function fullScreenPreview() {
    var textarea = document.getElementById("notebody")
    var htmlContent = `${md.render(textarea.value)}`
    if (fullPreviewClicked && document.getElementById("full")) {
        document.getElementById("full").style.display = "none";
        document.getElementById("splitScreen").disabled = false;
        document.getElementById("cancelEdit").disabled = false;
        document.getElementById("saveBtn").disabled = false
        textarea.style.display="unset";
        fullPreviewClicked = false;
        var elems = document.getElementsByClassName("md-buttons");
        for(var i = 0; i < elems.length; i++) {
            elems[i].disabled = false;
        }
    } else {
        document.getElementById("saveBtn").disabled = true;
        var elems = document.getElementsByClassName("md-buttons");
        for(var i = 0; i < elems.length; i++) {
            elems[i].disabled = true;
        }
        document.getElementById("cancelEdit").disabled = true;
        textarea.style.display="none";
        if(document.getElementById("full")){
            document.getElementById("full").style.display = "unset"
        } else {
            var preview = document.createElement("DIV"); // Create a <DIV> element
            preview.innerHTML = htmlContent; // Insert text
            preview.classList.add("full");
            preview.classList.add("markdown-body");
            preview.setAttribute("id", "full");
            document.getElementById("md-editor").appendChild(preview)
       }
        textarea.addEventListener('input', () => {
            htmlContent = `${md.render(textarea.value)}`
            document.getElementById("full").innerHTML = htmlContent
                // Highlight JS
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        })
        fullPreviewClicked = true;
    }
    document.getElementById("previewBtn").disabled = false;
}

// Split screen in two: text input and live markdown preview
var splitPreviewClicked = false;
function splitScreenPreview () {
    var textarea = document.getElementById("notebody")
    var htmlContent = `${md.render(textarea.value)}` || "[...][...]";
    if (splitPreviewClicked && document.getElementById("split")) {
        document.getElementById("split").style.display = "none"
        document.getElementById("previewBtn").disabled = false; 
        textarea.style.width="100%";
        splitPreviewClicked = false;
    } else {
        document.getElementById("previewBtn").disabled = true;
        textarea.style.width="50%"
        if(document.getElementById("split")){
            document.getElementById("split").style.display = "unset"
        } else
        {
            var preview = document.createElement("DIV"); // Create a <DIV> element
            preview.innerHTML = htmlContent; // Insert text
            preview.classList.add("split");
            preview.classList.add("markdown-body");
            preview.setAttribute("id", "split");
            document.getElementById("md-editor").appendChild(preview)
        }
        textarea.addEventListener('input', () => {
            htmlContent = `${md.render(textarea.value)}` || "[...]"
            document.getElementById("split").innerHTML = htmlContent
            // Highlight JS
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        })
        splitPreviewClicked = true;
    }
}

// Save Markdown
function saveData(data, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var blob = new Blob([data], { type: "text/plain;charset=utf-8" }),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

function downloadFile(e) {
    const html = document.getElementById("notebody").innerHTML;
    const markdown = turndownService.turndown(marked(html));
    const title = turndownService.turndown(marked(document.getElementById("title").innerHTML)).replace(/ /g,"_");
    const filename = `${title}.md`
    saveData(markdown, filename);
    e.preventDefault();
}

// Copy markdown
function copyMarkdown(){
    const title = document.getElementById('title').innerHTML;
    const notebody = document.getElementById('notebody').innerHTML;
    const html= `${notebody}`;
    // console.log(html);
    const markdown = turndownService.turndown(marked(html));
    copyToClipboard(markdown);
}

function copyToClipboard(markdown) {
    // console.log(markdown);
    var textArea = document.createElement("textarea");
    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;
    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';
    textArea.value = markdown;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}

// Handle the `paste` event
function handlePaste (e) {
    // Prevent the default action
    e.preventDefault();

    if(e.clipboardData) {
        // Get the copied text from the clipboard
        const text = (e.clipboardData)
            ? (e.originalEvent || e).clipboardData.getData('text/plain')
            // For IE
            : (window.clipboardData ? window.clipboardData.getData('Text') : '');

        // Get the copied text from the clipboard
        const html = (e.clipboardData)
            ? (e.originalEvent || e).clipboardData.getData('text/html')
            // For IE
            : (window.clipboardData ? window.clipboardData.getData('Html') : '');

        const pasteData = html ? turndownService.turndown(marked(html)) : text    

        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, pasteData);
        } else {
            // Insert text at the current position of caret
            const range = document.processInputection().getRangeAt(0);
            range.deleteContents();

            const textNode = document.createTextNode(pasteData);
            range.insertNode(textNode);
            range.selectNodeContents(textNode);
            range.collapse(false);

            const selection = window.processInputection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

// Handle Editor Keys
function handleKey(event) {
    if ( event.code === "Tab" ) {
        processInput('tab')
        event.preventDefault();
    } else if ( event.key === "\""){
        processInput('doublequote')
        event.preventDefault();
    } else if ( event.key === "\'"){
        processInput('singlequote')
        event.preventDefault();
    } else if ( event.key === "\("){
        processInput('brackets')
        event.preventDefault();
    } else if ( event.key === "\{"){
        processInput('curlybrackets')
        event.preventDefault();
    } else if ( event.key === "\["){
        processInput('squarebrackets')
        event.preventDefault();
    } else if ( event.key === "\<"){
        processInput('anglebrackets')
        event.preventDefault();
    } else if ( event.key === "\`") {
        processInput('backquote')
        event.preventDefault();
    }
}

// Delete selected notes
document.getElementById('delete').onclick = function() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    for (var checkbox of checkboxes) {
    //   console.log(checkbox.value + ' ');
      deleteNote(checkbox.value)
    }
  }
    
// Select all Notes
document.getElementById('select-all').onclick = function toggle(source) {
    var checkboxes = document.getElementsByName('checked');
    for (var checkbox of checkboxes) {
        checkbox.checked = document.getElementById('select-all').checked;
      }
  }  

// Select All Button
document.getElementById('selectBtn').onclick = () => {
    document.getElementById('select-all').click()
}

// Search Button
var input = document.getElementById('search');
$('.search-bar .icon').on('click', function() {
    $(this).parent().toggleClass('active-search');
    $('#gridView').toggleClass('disparu');
    $('#listView').toggleClass('disparu');
    input.focus();
  });

  // Filter input value
input.addEventListener("keyup", function (event) {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
   var filter = input.value.toUpperCase();
   var notesContainer = document.getElementById('notes');
   var noteTitles = notesContainer.querySelectorAll('label')
   for (i = 0; i < noteTitles.length; i++) {
       title = noteTitles[i].outerText
       if (title.toUpperCase().indexOf(filter) > -1) {
            // console.log(noteTitles[i].parentElement)
            noteTitles[i].parentElement.style.display = "";
        } else {
            noteTitles[i].parentElement.style.display = "none";
        }
   }
});

function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
      input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
    input.blur();
    input.focus();
  }

// Process customized textarea input 
function processInput(eventcode){
    // obtain the object reference for the textarea>
    var txtarea = document.getElementById("notebody");
    // obtain the index of the first selected character
    var start = txtarea.selectionStart;
    // obtain the index of the last selected character
    var finish = txtarea.selectionEnd;
    //obtain all Text
    var allText = txtarea.value; 
    // obtain the selected text
    sel = allText.substring(start, finish);
    var img = `![alt text](${sel})`
    var link = `[link](${sel})`
    keyCodes["image"].pattern = img;
    keyCodes["link"].pattern = link;
    var keyCode = keyCodes[eventcode]
    if(keyCode.regEx){
        var transsel="";
        var match = /\r|\n/.exec(sel);
        if (match) {
            var lines = sel.split('\n');
            for(var i = 0;i < lines.length;i++){
                if(lines[i].length > 0 && lines[i] !== undefined) {
                    transsel +=`${keyCode.pattern} ${lines[i]}\n`
                }  
            }
            sel = transsel;
        } else {sel = sel.replace(/^/gm, `${keyCode.pattern} `)}
        var newText = `${allText.substring(0, start)}${sel}${allText.substring(finish, allText.length)}`
        if (newText){
            txtarea.value=newText;
            if(eventcode === "tab"){
                setSelectionRange(txtarea, start+sel.length, start+sel.length)
            } else {
                setSelectionRange(txtarea, start+keyCode.offsetStart, start+keyCode.offsetStart)
            }
        }
    } else {
        if(keyCode.pattern !== ""){
            if(eventcode == "image" || eventcode == "link") {
                var newText = `${allText.substring(0, start)}${keyCode.pattern}${allText.substring(finish, allText.length)}`
            } else {
                var newText = `${allText.substring(0, start)}${sel}${keyCode.pattern}${allText.substring(finish, allText.length)}`
            }
        } else {
            var newText = `${allText.substring(0, start)}${keyCode.open}${sel}${keyCode.close}${allText.substring(finish, allText.length)}`
        }
        if(newText) {
            txtarea.value=newText;
            setSelectionRange(txtarea, start+keyCode.offsetStart, finish+keyCode.offsetEnd)
        }
    }
}

// Event listener for the 'beforeunload' event
window.addEventListener('beforeunload', function (e) {
    var body = document.querySelector("#notebody")
    var tagName = body.tagName.toLowerCase();
    // Check if any of the input fields are filled
    if ( body.value !== '' && tagName === 'textarea') {
        // Cancel the event and show alert that
        // the unsaved changes would be lost
        e.preventDefault();
        e.returnValue = '';
    }
});

loadDB()
queryDB()