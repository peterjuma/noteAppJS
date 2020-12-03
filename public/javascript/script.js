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
                            <input type="checkbox" id="check" name="checked" value='${cursor.key}' onclick="event.stopPropagation();" autocomplete="off">
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

window.onload = function() {
    setTimeout(loadAfterTime, 150)
 }; 
  
 function loadAfterTime(){
    var notes = document.getElementsByClassName('note')
    if(notes) {
        notes[0].click() 
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
                <div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                    <div class="shwBtnsR">
                        <button class="btnShow" onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit"></i></button>
                        <button class="btnShow" id="copy"  onclick="copyMarkdown()"><i class="fas fa-copy"></i></button>
                        <button class="btnShow" id="dwld"  onclick="downloadFile()"><i class="fas fa-download"></i></button>
                        <button class="btnShow" onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash"></i></button>
                    </div>
                    <div id="noteHtml">
                        <h1 class="notehead" id="title">${matching.title}</h1>
                        <div class="notebody" id="notebody">${marked(matching.body)}</div>
                    </div>
                </div>`
                editBox.style.display = "unset"
                editBox.innerHTML = html;
            } else{}
        }
        var e = document.createElement("base");
        e.target = "_blank";
        document.head.appendChild(e); 
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
                <div class="md-editor-tools">
                    <button class="md-buttons md-icon" data-tooltip="Bold" data-handler="bold" id="btnBold"><i class="fas fa-bold fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Italic" data-handler="italic" id="btnItalic"><i class="fas fa-italic fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Header" data-handler="heading" id="btnHeading"><i class="fas fa-heading fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Link" data-handler="link" id="btnLink"><i class="fas fa-link fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Ordered List" data-handler="olist" id="btnOList"><i class="fas fa-list-ol fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Unordered List" data-handler="ulist" id="btnUList"><i class="fas fa-list fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Quote" data-handler="quote" id="btnQuote"><i class="fas fa-quote-left fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Image" data-handler="image" id="btnImage"><i class="far fa-image fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Code" data-handler="code" id="btnCode"><i class="fas fa-code fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Code Block" data-handler="codeblock" id="btnCodeBlock"><i class="far fa-file-code fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Task List" data-handler="tasklist" id="btnTask"><i class="fas fa-check-square fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Table" data-handler="table" id="btnTable"><i class="fas fa-table fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Strikethrough" data-handler="strike" id="btnStrike"><i class="fas fa-strikethrough"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Horizontal Line" data-handler="hline" id="btnHline"><span style='font-size:16px;'>&mdash;</span></button>
                    <button class="md-buttons" data-tooltip="Preview" data-handler="preview" id="previewBtn" onclick="previewMarkdown()"><i class="fas fa-eye fa-sm"></i></button>
                    <button class="md-buttons" data-tooltip="Save" data-handler="save" id="saveBtn" onclick="save()"><i class="fas fa-save fa-sm"></i></button>
                    <button class="md-buttons" data-tooltip="Edit" data-handler="continue-edit" id="continue-edit" onclick="continueEdit()"><i class="fas fa-edit fa-sm"></i></button>
                    <button class="md-buttons" data-tooltip="Cancel" data-handler="cancel" onclick='cancelEdit("")' style="float: right;"><i class="fas fa-window-close fa-sm"></i></button>
                </div>
                <div class="md-preview" id="md-preview">
                </div> 
                <div class="md-editor" id="md-editor">
                    <textarea name="notebody" id="notebody" class="notebody" placeholder="Note"></textarea>
                </div> 
            </div>`
    editBox.innerHTML = html;
    document.getElementById("editor").style.display = "unset"
    document.getElementById("notebody").addEventListener('paste', handlePaste);
    document.getElementById('notebody').addEventListener('keydown', handleTab);
    document.querySelectorAll('.md-icon').forEach(item => {
        item.addEventListener('click', function(e){
            // console.log(this.dataset.handler)
            getSel(this.dataset.handler) 
          })
    })
})

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
    // Get textarea value with line breaks
    var noteText = document.getElementById("notebody").value
    var noteBody = noteText.replace(/\n\r?/g, '<br />');
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
            // console.log('Note added');
        }
    }  
    getNote(note.noteid)
    showNote(note.noteid)
    setTimeout(function(){
        document.getElementById(note.noteid).click()
   }, 150); //wait for atleast  200 ms before click action
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
                        <button onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}"  class="btn btnnote"  onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-sm"></i></button>
                        <button onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote"  onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-sm"></i></button>
                    </div>
                    <div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                                <div id="noteHtml">
                                    <h1 class="notehead" id="title">${matching.title}</h1>
                                    <div class="notebody" id="notebody">${marked(matching.body)}</div>
                                </div>
                            </div>
                    <div class="shwBtns">
                        <button class="btn" id="copy"  onclick="copyMarkdown()"><i class="fas fa-copy fa-sm"></i></button>
                        <button class="btn" id="dwld"  onclick="downloadFile()"><i class="fas fa-download fa-sm"></i></button>
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

    setTimeout(function(){
        document.getElementById(note.noteid).click()
   }, 100); // Wait for atleast  100 ms before click action
}

var gfm = turndownPluginGfm.gfm
const turndownService = new TurndownService();
turndownService.use(gfm)

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
                html = `<div name="" class="editnote" id="editpad" contenteditable="false">
                <input name="title" type="text" id="title" placeholder="Title" autocomplete="off">
                <div class="md-editor-tools">
                    <button class="md-buttons md-icon" data-tooltip="Bold" data-handler="bold" data-tooltip="Bold" id="btnBold"><i class="fas fa-bold fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Italic" data-handler="italic" id="btnItalic"><i class="fas fa-italic fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Header" data-handler="heading" id="btnHeading"><i class="fas fa-heading fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Link" data-handler="link" id="btnLink"><i class="fas fa-link fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Ordered List" data-handler="olist" id="btnOList"><i class="fas fa-list-ol fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Unordered List" data-handler="ulist" id="btnUList"><i class="fas fa-list fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Quote" data-handler="quote" id="btnQuote"><i class="fas fa-quote-left fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Image" data-handler="image" id="btnImage"><i class="far fa-image fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Code" data-handler="code" id="btnCode"><i class="fas fa-code fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Code Block" data-handler="codeblock" id="btnCodeBlock"><i class="far fa-file-code fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Task List" data-handler="tasklist" id="btnTask"><i class="fas fa-check-square fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Table" data-handler="table" id="btnTable"><i class="fas fa-table fa-sm"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Strikethrough" data-handler="strike" id="btnStrike"><i class="fas fa-strikethrough"></i></button>
                    <button class="md-buttons md-icon" data-tooltip="Horizontal Line" data-handler="hline" id="btnHline"><span style='font-size:16px;'>&mdash;</span></button>
                    <button class="md-buttons" data-tooltip="Save" data-handler="save" id="updateBtn" onclick='update(this)' name="${matching.noteid}" data-noteid="${matching.noteid}"><i class="fa fa-save fa-sm" aria-hidden="true"></i></button>
                    <button class="md-buttons" data-tooltip="Preview" data-handler="preview" id="previewBtn"  onclick="previewMarkdown(${matching.noteid})"><i class="fas fa-eye fa-sm"></i></button>
                    <button class="md-buttons" data-tooltip="Edit" data-handler="continue-edit" id="continue-edit" name="${matching.noteid}" onclick="continueEdit(${matching.noteid})"><i class="fas fa-edit fa-sm"></i></button>
                    <button class="md-buttons" data-tooltip="Cancel" data-handler="cancel" onclick='cancelEdit(this)' name="${matching.noteid}" data-noteid="${matching.noteid}"><i class="fas fa-window-close fa-sm"></i></button>
                </div>
                <div class="md-preview" id="md-preview">
                </div> 
                <div class="md-editor" id="md-editor">
                    <textarea name="notebody" id="notebody" class="notebody" placeholder="Note"></textarea>
                </div> 
            </div>`
                editBox.innerHTML = html;
                document.getElementById("title").value = turndownService.turndown(marked(matching.title));
                document.getElementById("notebody").value = turndownService.turndown(marked(matching.body));
                document.getElementById("editor").style.display = "unset"
                document.getElementById("notebody").addEventListener('paste', handlePaste);
                document.getElementById('notebody').addEventListener('keydown', handleTab);
                document.querySelectorAll('.md-icon').forEach(item => {
                    item.addEventListener('click', function(e){
                        // console.log(this.dataset.handler)
                        getSel(this.dataset.handler) 
                    })
                })

                document.getElementById("continue-edit").disabled = true;
            } else { }
        }
    }
}

//Preview Markdown
function previewMarkdown(noteid){
    const title = document.getElementById("title").innerHTML
    const body = document.getElementById("notebody").value
    html = `<div class="preview markdown-body" data-noteid="preview" id="editpad">
                <div id="notebody" class="notebody" name="notebody">${marked(body)}</div>
            </div>`
    document.getElementById("md-editor").style.display = "none"
    document.getElementById("md-preview").style.display = "unset"
    document.getElementById("md-preview").innerHTML = html;

    var elems = document.getElementsByClassName("md-buttons");
    for(var i = 0; i < elems.length; i++) {
        elems[i].disabled = true;
    }

    document.getElementById("continue-edit").disabled = false;

}

// Continue Editing
function continueEdit(noteid){
    const title = document.getElementById("title").value
    const body = document.getElementById("notebody").innerHTML
    html = `<div name="" class="editnote" id="editpad" contenteditable="false">
    <input name="title" type="text" id="title" placeholder="Title" autocomplete="off">
    <div class="md-editor-tools">
        <button class="md-buttons md-icon" data-tooltip="Bold" data-handler="bold" data-tooltip="Bold" id="btnBold"><i class="fas fa-bold fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Italic" data-handler="italic" id="btnItalic"><i class="fas fa-italic fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Header" data-handler="heading" id="btnHeading"><i class="fas fa-heading fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Link" data-handler="link" id="btnLink"><i class="fas fa-link fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Ordered List" data-handler="olist" id="btnOList"><i class="fas fa-list-ol fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Unordered List" data-handler="ulist" id="btnUList"><i class="fas fa-list fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Quote" data-handler="quote" id="btnQuote"><i class="fas fa-quote-left fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Image" data-handler="image" id="btnImage"><i class="far fa-image fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Code" data-handler="code" id="btnCode"><i class="fas fa-code fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Code Block" data-handler="codeblock" id="btnCodeBlock"><i class="far fa-file-code fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Task List" data-handler="tasklist" id="btnTask"><i class="fas fa-check-square fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Table" data-handler="table" id="btnTable"><i class="fas fa-table fa-sm"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Strikethrough" data-handler="strike" id="btnStrike"><i class="fas fa-strikethrough"></i></button>
        <button class="md-buttons md-icon" data-tooltip="Horizontal Line" data-handler="hline" id="btnHline"><span style='font-size:16px;'>&mdash;</span></button>
        <button class="md-buttons md-icon" data-tooltip="Underline" data-handler="underline" id="btnUnderline"><i class="fas fa-underline"></i></button>
        <button class="md-buttons" data-tooltip="Save" data-handler="save" id="updateBtn" onclick='update(this)' name="${noteid}" data-noteid="${noteid}"><i class="fa fa-save fa-sm" aria-hidden="true"></i></button>
        <button class="md-buttons" data-tooltip="Preview" data-handler="preview" id="previewBtn"  onclick="previewMarkdown(${noteid})"><i class="fas fa-eye fa-sm"></i></button>
        <button class="md-buttons" data-tooltip="Edit" data-handler="continue-edit" id="continue-edit" name="${noteid}" onclick="continueEdit()"><i class="fas fa-edit fa-sm"></i></button>
        <button class="md-buttons" data-tooltip="Cancel" data-handler="cancel" onclick='cancelEdit(this)' name="${noteid}" data-noteid="${noteid}"><i class="fas fa-window-close fa-sm"></i></button>
    </div>
    <div class="md-preview" id="md-preview">
    </div> 
    <div class="md-editor" id="md-editor">
        <textarea name="notebody" id="notebody" class="notebody" placeholder="Note"></textarea>
    </div> 
</div>`
    editBox.innerHTML = html;
    document.getElementById("title").value = turndownService.turndown(marked(title));
    document.getElementById("notebody").value = turndownService.turndown(marked(body));
    document.getElementById("editor").style.display = "unset"
    document.getElementById("notebody").addEventListener('paste', handlePaste);
    document.getElementById('notebody').addEventListener('keydown', handleTab);
    document.querySelectorAll('.md-icon').forEach(item => {
        item.addEventListener('click', function(e){
            // console.log(this.dataset.handler)
            getSel(this.dataset.handler) 
        })
    })

    document.getElementById("continue-edit").disabled = true;
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
            // console.log(noteTitles[i].parentElement)
            noteTitles[i].parentElement.style.display = "";
        } else {
            noteTitles[i].parentElement.style.display = "none";
        }
   }
});

// Editor Buttons

function getSel(button_handler) // javascript
{  
    // obtain the object reference for the textarea>
    var txtarea = document.getElementById("notebody");
    // obtain the index of the first selected character
    var start = txtarea.selectionStart;
    // obtain the index of the last selected character
    var finish = txtarea.selectionEnd;
    //obtain all Text
    var allText = txtarea.value;

    // console.log(button_handler)
    
    // obtain the selected text
    var sel = allText.substring(start, finish);
    //append te text;

    var link = `[](https://)`
    var img = `![](https://)`
    var cblock = `\`\`\``
    var tbl = 
`column1 | column2 | column3  
------- | ------- | -------  
column1 | column2 | column3  
column1 | column2 | column3  
column1 | column2 | column3`

    var tilde = `~~`

    var hline = `----`

    switch(button_handler) {
        case "code":
            var newText = `${allText.substring(0, start)}\`${sel}\`${allText.substring(finish, allText.length)}`
            break;
        case "bold":
            var newText = `${allText.substring(0, start)}\*\*${sel}\*\*${allText.substring(finish, allText.length)}`
            break;
        case "italic":
            var newText = `${allText.substring(0, start)}\_${sel}\_${allText.substring(finish, allText.length)}`
            break;
        case "heading":
            var newText = `${allText.substring(0, start)}\# ${sel}${allText.substring(finish, allText.length)}`
            break;
        case "link":
            var newText = `${allText.substring(0, start)}${link}${allText.substring(finish, allText.length)}`
            break;
        case "ulist":
            var newText = `${allText.substring(0, start)}\- ${sel}${allText.substring(finish, allText.length)}`
            break;
        case "olist":
            var newText = `${allText.substring(0, start)}1\. ${sel}${allText.substring(finish, allText.length)}`
            break;
        case "quote":
            var newText = `${allText.substring(0, start)}\> ${sel}${allText.substring(finish, allText.length)}`
            break;
        case "image":
            var newText = `${allText.substring(0, start)}${img}${allText.substring(finish, allText.length)}`
            break;
        case "tasklist":
            var newText = `${allText.substring(0, start)}\-[] ${sel}${allText.substring(finish, allText.length)}`
            break;
        case "codeblock":
            var newText = `${allText.substring(0, start)}${cblock}\n${sel}\n${cblock}${allText.substring(finish, allText.length)}`
            break;
        case "table":
            var newText = `${allText.substring(0, start)}\n${tbl}\n${sel}${allText.substring(finish, allText.length)}`
            break;
        case "strike":
            var newText = `${allText.substring(0, start)}${tilde}${sel}${tilde}${allText.substring(finish, allText.length)}`
            break;
        case "hline":
            var newText = `${allText.substring(0, start)}${sel}\n${hline}${allText.substring(finish, allText.length)}`
            break;
        default:
            // Functionality
            break;
    }

    if (newText) {
        txtarea.value=newText;
    } 
}

loadDB()
queryDB()