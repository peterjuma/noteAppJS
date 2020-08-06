var express = require('express'); 
var app = express(); 
var path = require('path');
var PORT = 3018; 

// View engine setup 
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
 });

app.listen(PORT, function(err){ 
	if (err) console.log(err); 
	console.log("Server listening on PORT", PORT); 
}); 
