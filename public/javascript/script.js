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
    initialLoad = (notesData) => {
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
        // Create an index to search customers by name and email
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('body', 'body', { unique: true });

        // Populate the database with the initial set of rows
        notesData.forEach(function (note) {
            objectStore.put(note);
        });
        db.close();
    };
    }
}

var DBNAME = "nodesdb"
var load = document.getElementById("load")
var clear = document.getElementById("clear")

const loadDB = () => {
    console.log('Load the Notes database');
    // Notes to add to initially populate the database with
    const notesData = [
        { noteid: '444', title: 'Love _is_ bold', body: '## Marked in the browser Rendered by **marked**' },
        { noteid: '555', title: 'Aenean viverra rhoncus', body: 'Vestibulum ullamcorper mauris at ligula. Ut id nisl quis enim dignissim sagittis.' }
    ];
    let notes = new Notes(DBNAME);
    notes.initialLoad(notesData);
    queryDB()
}

load.addEventListener("click", loadDB)
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

const queryDB = () => {
    var connection = indexedDB.open(DBNAME);
    var notesGrid = document.getElementById("notes")
    connection.onsuccess = function () {
        db = connection.result;
        var tx = db.transaction('notes', "readonly")
        var cust = tx.objectStore("notes")
        var request = cust.openCursor()
        request.onsuccess = (e) => {
            var cursor = e.target.result
            if (cursor) {
               //`{noteid: ${cursor.key}, title: ${cursor.value.title}, body: ${cursor.value.body}}`  

                html = `<div class="column note">
                        <h2>${cursor.value.title}</h2>
                        <span class="notebody"></span>
                        </div>`;
                notesGrid.innerHTML += '<div class="column note">' +
                                        '<h2>' + marked(cursor.value.title) + '</h2>' + 
                                        '<span class="notebody">' + marked(cursor.value.body) + '</span>' + 
                                        '</div>';  
                cursor.continue()
            }
        }
    };
}

// Add date
// Add Author

