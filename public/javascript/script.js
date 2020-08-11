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
var editContainer = document.getElementById("editContainer");
var editbtns = editContainer.getElementsByClassName("btn");
for (var i = 0; i < editbtns.length; i++) {
    editbtns[i].addEventListener("click", function () {
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
            //`{noteid: ${cursor.key}, title: ${cursor.value.title}, body: ${cursor.value.body}}`  
            // contenteditable
                var date_diff = countDown(cursor.value.created_at)
                var ago = []
                date_diff.days > 0 ? ago[0] = (date_diff.days + "d ago") : date_diff.hours > 0 ? ago[1] = (date_diff.hours + "h ago") : date_diff.minutes > 0 ? ago[2] = (date_diff.minutes + "m ago") : ago[2] = "now"
                console.log(ago)
                html = `<div class="column note" id="${cursor.key}" onclick='showNote(this)'>
                            <h2>${marked(cursor.value.title)}</h2>
                             <caption>Created ${ago[0]||""} ${ago[1]||""} ${ago[2]||""}</caption>
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
                html = `<div name=${matching.noteid} class="editor" id="editpad">
                        <button onclick='editNote(this)' name="${matching.noteid}"  class="btn btnnote" style="float: left;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-lg"></i></button>
                        <button onclick='deleteNote(this)' name="${matching.noteid}"  class="btn btnnote" style="float: right;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                           <h1 style="text-align: center;">${marked(matching.title)}</h1>
                            <p style="text-align: left;">${marked(matching.body)}</p>
                        </div>`
                editBox.style.display = "unset"
                editBox.innerHTML = html;
                // document.getElementById("saveBtn").disabled = true;
            } else{}
        }
    } 
    // document.getElementById(notediv.id).classList.add("active") 
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
    html = `<div name="" class="editor" id="editpad" contenteditable="false">
                <input name="title" type="text" id="title" placeholder="Note Title">
                <textarea name="notebody" cols="30" rows="10" id="notebody" placeholder="Body..."></textarea>
            </div>
            <div class="editBtns">
                <button onclick='cancelEdit("")' class="btn btnnote" style="float: right; background-color: #ddd;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close fa-lg"></i> Cancel</button>
                <button class="btn" id="saveBtn" style="float: left;" onclick="save()"><i class="fas fa-save fa-lg"></i> Save</button>
            </div>`
    editBox.innerHTML = html;
    // document.getElementById("saveBtn").disabled = false;
    document.getElementById("editor").style.display = "unset"
    // document.getElementById("addBtn").disabled = true;
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
            console.log('Note ' + noteid + ' deleted.');

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
    console.log(note)
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
    // document.getElementById("title").value = ""
    // document.getElementById("notebody").value = ""
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
    console.log(note)
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
                // html = `<div class="column note" id="${matching.noteid}" onclick='showNote(this)'>
                //             <h2>${marked(matching.title)}</h2>
                //         </div>`;
                // notesGrid.innerHTML += html;
                notesGrid.innerHTML = "";
                queryDB()
                html2 = `<div name=${matching.noteid} class="editor" id="editpad">
                        <button onclick='editNote(this)' name="${matching.noteid}"  class="btn btnnote" style="float: left;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-lg"></i></button>
                        <button onclick='deleteNote(this)' name="${matching.noteid}"  class="btn btnnote" style="float: right;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                           <h1 style="text-align: center;">${marked(matching.title)}</h1>
                            <p style="text-align: left;">${marked(matching.body)}</p>
                        </div>`
                editBox.innerHTML = html2;
            } else {}
        }
    }
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
            console.log('Note updated' + note);
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
                html = `<div name=${matching.noteid} class="editor" id="editpad">
                            <input name="title" type="text" id="title">
                            <textarea name="notebody" id="notebody"></textarea>
                        </div>
                        <div class="editBtns">
                            <button onclick='update(this)' name="${matching.noteid}" class="btn btnnote" style="float: left; background-color: #ddd; margin-top: 17px;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fa fa-check fa-lg" aria-hidden="true"></i> OK</button>
                            <button onclick='cancelEdit(this)' name="${matching.noteid}" class="btn btnnote" style="float: right; background-color: #ddd;margin-top: 17px;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fas fa-window-close fa-lg"></i> Cancel</button>
                        </div>`
                editBox.innerHTML = html;
                document.getElementById("title").value = turndownService.turndown(marked(matching.title));
                document.getElementById("notebody").value = turndownService.turndown(marked(matching.body));
                // document.getElementById("saveBtn").disabled = true;
            } else { }
        }
    }
}

loadDB()
queryDB()
