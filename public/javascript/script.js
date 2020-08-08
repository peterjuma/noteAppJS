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

        // Populate the database with the initial set of rows
        // notesData.forEach(function (note) {
        //     objectStore.put(note);
        // });
        db.close();
    };
    }
}

var DBNAME = "notesdb"
var load = document.getElementById("load")
var clear = document.getElementById("clear")

const loadDB = () => {
    console.log('Load the Notes database');
    // Notes to add to initially populate the database with
    // const notesData = [
    //     { noteid: '444', title: 'Love _is_ bold', body: 'Marked in the browser Rendered by **marked**' },
    //     { noteid: '555', title: 'Aenean viverra rhoncus', body: 'Vestibulum ullamcorper mauris at ligula. Ut id nisl quis enim dignissim sagittis.' }
    // ];
    let notes = new Notes(DBNAME);
    notes.initialLoad();
}

clear.addEventListener("click", deleteDB)

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
                html = `<div class="column note" id="${cursor.key}" onclick='showNote(this)'>
                            <h2>${marked(cursor.value.title)}</h2>
                        </div>`;
                notesGrid.innerHTML += html;
                cursor.continue()
            }
        }
    };
}

let btnAction = document.getElementsByClassName("btnnote")
var editBox = document.getElementById("editor")

// Show notes when grid box clicked
function showNote(notediv){
    var noteid = notediv.id;
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
                editBox.innerHTML = html;
            } else{}
        }
    }       
}

var editPad = document.getElementById("editpad")
var newNote = document.getElementById("addBtn")

newNote.addEventListener("click", () => {
    html = `<div name="" class="editor" id="editpad" contenteditable="false">
                            <input name="title" type="text" id="title" placeholder="Note Title">
                            <textarea name="notebody" cols="30" rows="10" id="notebody" placeholder="Body..."></textarea>
                        </div>`
    editBox.innerHTML = html;
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

// Get new note values from the UI
function save() {
    function genID(d) {
        return Math.floor(d / 1000);
    }
    var noteTitle = document.getElementById("title").value
    var noteBody = document.getElementById("notebody").value
    var d = new Date()
    var id = genID(d); 
    const note = {
        noteid: id.toString(),
        title: noteTitle,
        body: noteBody
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
    document.getElementById("title").value = ""
    document.getElementById("notebody").value = ""
}

// Get updated values from the UI and generate a JSON object
function update(editdiv) {
    var id = editdiv.name
    var noteTitle = document.getElementById("title").value
    var noteBody = document.getElementById("notebody").value
    const note = {
        noteid: id.toString(),
        title: noteTitle,
        body: noteBody
    };
    console.log(note)
    updateNote(note)
}

// Update note in the database
function updateNote(note){
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

// Get single not to display in the list and details areas
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
                html = `<div class="column note" id="${matching.noteid}" onclick='showNote(this)'>
                            <h2>${marked(matching.title)}</h2>
                        </div>`;
                notesGrid.innerHTML += html;
                html2 = `<div name=${matching.noteid} class="editor" id="editpad">
                        <button onclick='editNote(this)' name="${matching.noteid}"  class="btn btnnote" style="float: left;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='green'"><i class="fa fa-edit fa-lg"></i></button>
                        <button onclick='deleteNote(this)' name="${matching.noteid}"  class="btn btnnote" style="float: right;" onMouseOut="this.style.color='black'" onMouseOver="this.style.color='red'"><i class="fa fa-trash fa-lg"></i></button>
                           <h1 style="text-align: center;">${marked(matching.title)}</h1>
                            <p style="text-align: left;">${marked(matching.body)}</p>
                        </div>`
                editBox.innerHTML = html2;
            } else { }
        }
    }
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
                            <textarea style="margin-top: 20px;" name="notebody" id="notebody"></textarea>
                            <button onclick='update(this)' name="${matching.noteid}" class="btn btnnote" style="float: left;" onMouseOut="this.style.color='crimson'" onMouseOver="this.style.color='green'"><i class="fa fa-save fa-2x"></i></button>
                        </div>`
                editBox.innerHTML = html;
                document.getElementById("title").value = turndownService.turndown(marked(matching.title));
                document.getElementById("notebody").value = turndownService.turndown(marked(matching.body));
            } else { }
        }
    }
}

loadDB()
queryDB()