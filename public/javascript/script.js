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
var btns = container.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
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
                            <h2>${marked(cursor.value.title)}</h2>
                             <span><caption>Created ${ago[0]||""} ${ago[1]||""} ${ago[2]||""}</caption></span>
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
                html = `<div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                        <button onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}"  class="btn btnnote" style="float: left;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-lg"></i></button>
                        <button onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote" style="float: right;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                           <h1 class="notehead">${marked(matching.title)}</h1>
                            <p class="notebody">${marked(matching.body)}</p>
                        </div>`
                editBox.style.display = "unset"
                editBox.innerHTML = html;
            } else{}
        }
    } 
}

function noteSelect(){
    var noteList = document.getElementsByClassName("note");
    for (var i = 0; i < noteList.length; i++) {
        noteList[i].addEventListener("click", function () {
            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }
}

var editPad = document.getElementById("editpad")
var newNote = document.getElementById("addBtn")
newNote.addEventListener("click", () => {
    html = `<div name="" class="editnote markdown-body" id="editpad" contenteditable="false">
                <input name="title" type="text" id="title" placeholder="Note Title">
                <textarea name="notebody" cols="30" rows="10" id="notebody" placeholder="Body..."></textarea>
            </div>
            <div class="editBtns">
                <button class="btn" id="saveBtn" style="float: left;" onclick="save()"><i class="fas fa-save"></i> Save</button>
                <button class="btn" id="previewBtn" style="float: center;" onclick="previewMarkdown()"><i class="fas fa-eye"></i> Preview</button>
                <button onclick='cancelEdit("")' class="btn btnnote" style="float: right; background-color: #ddd;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close"></i> Cancel</button>
            </div>`
    editBox.innerHTML = html;
    document.getElementById("editor").style.display = "unset"
})

// Delete single note by noteid
function deleteNote(notediv) {
    var noteid = notediv.name;
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
            console.log('Note added' + note );
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
    if(notediv){
        showNote(notediv)
    } else {
        document.getElementById("editor").style.display = "none"
        // document.getElementById("saveBtn").disabled = true;
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
                html2 = `<div name=${matching.noteid} data-noteid="${matching.noteid}" class="shownote markdown-body" id="editpad">
                        <button onclick='editNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote" style="float: left;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-lg"></i></button>
                        <button onclick='deleteNote(this)' name="${matching.noteid}" data-noteid="${matching.noteid}"  class="btn btnnote" style="float: right;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                           <h1 style="text-align: center;">${marked(matching.title)}</h1>
                            <p style="text-align: left;">${marked(matching.body)}</p>
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
                            <textarea name="notebody" id="notebody"></textarea>
                        </div>
                        <div class="editBtns">
                            <button onclick='update(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote" style="float: left; background-color: #ddd; margin-top: 7px;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fa fa-save fa-lg" aria-hidden="true"></i> Save</button>
                            <button class="btn" id="previewBtn" style="float: center;" onclick="previewMarkdown(${matching.noteid})"><i class="fas fa-eye fa-lg"></i> Preview</button>
                            <button onclick='cancelEdit(this)' name="${matching.noteid}" data-noteid="${matching.noteid}" class="btn btnnote" style="float: right; background-color: #ddd;margin-top: 7px;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close fa-lg"></i> Cancel</button>
                        </div>`
                editBox.innerHTML = html;
                document.getElementById("title").value = turndownService.turndown(marked(matching.title));
                document.getElementById("notebody").value = turndownService.turndown(marked(matching.body));
            } else { }
        }
    }
}

//Preview Markdown
function previewMarkdown(noteid){
    const title = document.getElementById("title").value
    const body = document.getElementById("notebody").value
    html = `<div class="preview markdown-body" data-noteid="${noteid}" id="editpad">
            <h1 class="notehead" id="title">${marked(title)}</h1>
            <div id="notebody">${marked(body)}</div>
            </div>
            <div class="center"><button class="btn" id="continue" onclick="continueEdit(${noteid})" style="font-size: 16px;"><i class="fas fa-edit fa-lg"></i> Continue</button></div>`
    editBox.style.display = "unset"
    editBox.innerHTML = html;
}

// Continue Editing
function continueEdit(noteid){
    const title = document.getElementById("title").innerHTML
    const body = document.getElementById("notebody").innerHTML
    html = `<div name=${noteid} class="editnote" id="editpad">
    <input name="title" type="text" id="title">
    <textarea name="notebody" id="notebody"></textarea>
    </div>
    <div class="editBtns">
        <button onclick='update(this)' name="${noteid}" data-noteid="${noteid}" class="btn btnnote" style="float: left; background-color: #ddd; margin-top: 7px;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fa fa-save fa-lg" aria-hidden="true"></i> Save</button>
        <button class="btn" id="previewBtn" style="float: center;" onclick="previewMarkdown(${noteid})"><i class="fas fa-eye fa-lg"></i> Preview</button>
        <button onclick='cancelEdit(this)' name="${noteid}" data-noteid="${noteid}" class="btn btnnote" style="float: right; background-color: #ddd;margin-top: 7px;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close fa-lg"></i> Cancel</button>
    </div>`
    editBox.innerHTML = html;
    document.getElementById("title").value = turndownService.turndown(marked(title));
    document.getElementById("notebody").value = turndownService.turndown(marked(body));
}

loadDB()
queryDB()
