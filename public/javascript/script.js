// alert("Connected!")
// Get the elements with class="column"
var elements = document.getElementsByClassName("column");

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
// var clear = document.getElementById("clear")

const loadDB = () => {
    console.log('Load the Notes database');
    let notes = new Notes(DBNAME);
    notes.initialLoad();
    // document.getElementById("saveBtn").disabled = true;
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
            // contenteditable
                var date_diff = countDown(cursor.value.created_at)
                var ago = []
                date_diff.days > 0 ? ago[0] = (date_diff.days + "d ago") : date_diff.hours > 0 ? ago[1] = (date_diff.hours + "h ago") : date_diff.minutes > 0 ? ago[2] = (date_diff.minutes + "m ago") : ago[2] = "now"
                html = `<div class="column note" id="${cursor.key}" onclick='showNote(this)'>
                            <input type="checkbox" id="vehicle1" name="checked" value='${cursor.key}' onclick="event.stopPropagation();">
                            <label for="checked"> ${cursor.value.title}</label><br><br>
                            <div class="caption"><caption>Created ${ago[0]||""} ${ago[1]||""} ${ago[2]||""}</caption></div>
                        </div>`;
                notesGrid.innerHTML += html;
                noteSelect() 
                cursor.continue()
            }
        }
    }
}

let btnAction = document.getElementsByClassName("btnnote")
var editBox = document.getElementById("editor")

// Show note when grid box clicked
function showNote(notediv){
    var noteid = notediv.id || notediv.name || notediv;
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
                    <button onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}"  class="btn btnnote"  onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-lg"></i></button>
                    <button onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote"  onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                </div>
                <div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                            <div id="noteHtml">
                                <h1 class="notehead" id="title">${matching.title}</h1>
                                <div class="notebody" id="notebody">${marked(matching.body)}</div>
                            </div>
                        </div>
                <div class="shwBtns">
                    <button class="btn" id="copy"  onclick="copyMarkdown()"><i class="fas fa-copy fa-lg"></i></button>
                    <button class="btn" id="dwld"  onclick="saveFile()"><i class="fas fa-download fa-lg"></i></button>
                </div>`
                editBox.style.display = "unset"
                editBox.innerHTML = html;
            } else{}
        }
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
                <input name="title" type="text" id="title" placeholder="Note Title">
                <hr>
                <textarea name="notebody" cols="30" rows="10" id="notebody" placeholder="Body..."></textarea>
            </div>
            <div class="editBtns">
                <button class="btn btnnote" id="saveBtn" style="float: left;" onclick="save()"><i class="fas fa-save fa-lg"></i></button>
                <button class="btn btnnote" id="previewBtn" style="float: center;" onclick="previewMarkdown()"><i class="fas fa-eye fa-lg"></i></button>
                <button onclick='cancelEdit("")' class="btn btnnote" style="float: right;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close fa-lg"></i></button>
            </div>`
    editBox.innerHTML = html;
    document.getElementById("editor").style.display = "unset"
    document.getElementById("notebody").addEventListener('paste', handlePaste);
    document.getElementById('notebody').addEventListener('keydown', handleTab);
})

// Delete single note by noteid
function deleteNote(notediv) {
    var noteid = notediv.name || notediv;
    document.getElementById(noteid).style.display = "none"
    editBox.innerHTML = "";
    console.log(noteid)
    var connection = indexedDB.open(DBNAME);
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readwrite")
        var store = tx.objectStore("notes")
        store.delete(noteid);
        tx.oncomplete = function () {

        }
    }
}

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

// Get new note values from the UI
function save() {
    var noteTitle = document.getElementById("title").value
    var noteBody = document.getElementById("notebody").value
    var id = Math.round(Date.now() / 1000)  
    const note = {
        noteid: id.toString(),
        title: noteTitle,
        body: noteBody,
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
            console.log('Note added');
        }
    }  
    getNote(note.noteid)
    showNote(note.noteid)
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

function cancelEdit(notediv){
    document.getElementById("editor").style.display = "none"
    if(notediv.name !== "undefined"){
        showNote(notediv)
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
                html2 = `
                    <div class="shwBtns">
                        <button onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}"  class="btn btnnote"  onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-lg"></i></button>
                        <button onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote"  onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                    </div>
                    <div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                                <div id="noteHtml">
                                    <h1 class="notehead" id="title">${matching.title}</h1>
                                    <div class="notebody" id="notebody">${marked(matching.body)}</div>
                                </div>
                            </div>
                    <div class="shwBtns">
                        <button class="btn" id="copy"  onclick="copyMarkdown()"><i class="fas fa-copy fa-lg"></i></button>
                        <button class="btn" id="dwld"  onclick="saveFile()"><i class="fas fa-download fa-lg"></i></button>
                    </div>`
                editBox.innerHTML = html2;
            } 
        }
    }
    queryDB()
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
            document.getElementById(note.noteid).style.display = "none"
        }
    }
    getNote(note.noteid)
}

const turndownService = new TurndownService();

// Get single note for editing
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
                html = `<div name=${matching.noteid} class="editnote" id="editpad">
                            <input name="title" type="text" id="title">
                            <hr>
                            <textarea name="notebody" id="notebody"></textarea>
                        </div>
                        <div class="editBtns">
                            <button onclick='update(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote"  onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fa fa-save fa-lg" aria-hidden="true"></i></button>
                            <button class="btn btnnote" id="previewBtn" style="float: center;" onclick="previewMarkdown(${matching.noteid})"><i class="fas fa-eye fa-lg"></i></button>
                            <button onclick='cancelEdit(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close fa-lg"></i></button>
                        </div>`
                editBox.innerHTML = html;
                document.getElementById("title").value = turndownService.turndown(marked(matching.title));
                document.getElementById("notebody").value = turndownService.turndown(marked(matching.body));
                document.getElementById("notebody").addEventListener('paste', handlePaste);
                document.getElementById('notebody').addEventListener('keydown', handleTab);
            } else { }
        }
    }
}

//Preview Markdown
function previewMarkdown(noteid){
    const title = document.getElementById("title").value
    const body = document.getElementById("notebody").value
    html = `<div class="preview markdown-body" data-noteid="${noteid}" id="editpad">
                <h1 class="notehead" id="title">${title}</h1>
                <div id="notebody">${marked(body)}</div>
            </div>
            <div class="continueBtn"><button class="btn" id="continue" name="${noteid}" onclick="continueEdit(${noteid})" style="font-size: 16px;"><i class="fas fa-edit"></i></button></div>`
    editBox.style.display = "unset"
    editBox.innerHTML = html;
}

// Continue Editing
function continueEdit(noteid){
    const title = document.getElementById("title").innerHTML
    const body = document.getElementById("notebody").innerHTML
    html = `<div name=${noteid} class="editnote" id="editpad">
                <input name="title" type="text" id="title">
                <hr>
                <textarea name="notebody" id="notebody"></textarea>
            </div>
            <div class="editBtns">
                <button onclick='update(this)' name="${noteid}" data-noteid="${noteid}" class="btn btnnote" style="float: left;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fa fa-save fa-lg" aria-hidden="true"></i></button>
                <button class="btn btnnote" id="previewBtn" style="float: center;" onclick="previewMarkdown(${noteid})"><i class="fas fa-eye fa-lg"></i></button>
                <button onclick='cancelEdit(this)' name="${noteid}" data-noteid="${noteid}" class="btn btnnote" style="float: right;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close fa-lg"></i></button>
            </div>`
    editBox.innerHTML = html;
    document.getElementById("title").value = turndownService.turndown(marked(title));
    document.getElementById("notebody").value = turndownService.turndown(marked(body));
    document.getElementById("notebody").addEventListener('paste', handlePaste);
    document.getElementById('notebody').addEventListener('keydown', handleTab);
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

function saveFile(e) {
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

    // const pasteData = html || text;
    const pasteData = turndownService.turndown(marked(html || text))

    if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, pasteData);
    } else {
        // Insert text at the current position of caret
        const range = document.getSelection().getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(pasteData);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

// Handle TAB
function handleTab(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
  
      // set textarea value to: text before caret + tab + text after caret
      this.value = this.value.substring(0, start) +
        "\t" + this.value.substring(end);
  
      // put caret at right position again
      this.selectionStart =
        this.selectionEnd = start + 1;
    }
  }

// Delete selected notes
document.getElementById('delete').onclick = function() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    for (var checkbox of checkboxes) {
      console.log(checkbox.value + ' ');
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
$('.search-bar .icon').on('click', function() {
    $(this).parent().toggleClass('active-search');
  });

  // Filter input value
var input = document.getElementById('search');
input.addEventListener("keyup", event => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
   var filter = input.value.toUpperCase();
   var notesContainer = document.getElementById('notes');
   var noteTitles = notesContainer.querySelectorAll('label')
   for (i = 0; i < noteTitles.length; i++) {
       title = noteTitles[i].outerText
       if (title.toUpperCase().indexOf(filter) > -1) {
            console.log(noteTitles[i].parentElement)
            noteTitles[i].parentElement.style.display = "";
        } else {
            noteTitles[i].parentElement.style.display = "none";
        }
   }
});

loadDB()
queryDB()

