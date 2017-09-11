// Setting up express to work with socket.io
var express = require('express');
var app = express();
var path = require('path');
// These are our routes, connecting GET requests
// to the appropriate files.
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/client.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/client.js'));
});
app.get('/style/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/style/style.css'));
});

// Setting up port 3003 to be listened to,
// and hooking socket.io up to it
var io = app.listen(3003);
var server = require('socket.io').listen(io);

// Setup data
const firstTodos = require('./data');
// Todo class
const Todo = require('./todo');

// Found this cool idea online to use a flag
// to tell if the server has been reset or not
let serverStarted = false;
// First, we start the DB off empty
let DB = [];

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db
    
    // Then, if the server was restarted, we populate the
    // DB with firstTodos array
    if (!serverStarted) {
        DB = firstTodos.map((t) => {
            // Form new Todo objects
            return new Todo(t.title);
        });
    }
    
    // And now, we know the server is running, so we set
    // our flag to true!
    serverStarted = true;

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        server.emit('load', DB);
    };
    
    // Sends a message to the client to add a single todo
    const appendTodo = (todo) => {
        server.emit('loadSingle', todo);
    };

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);

        // Push this newly created todo to our database
        DB.push(newTodo);
        // Send just the newly made todo to the client
        appendTodo(newTodo);
    });
    
    // TODO: This is a mock-up of what I imagine the delete
    // function will be like
    client.on('delete', (t) => {
        // Given the todo, delete it from the list
        // FIXME: This will delete any Todo with the same
        // title contents.  This should only delete the selected
        // Todo.
        const newDB = DB.filter((item) => {
            return item.id !== t.id;
        });
        
        DB = newDB;
        //Update the other clients
        server.emit('load', DB);
    });
    
    // TODO: Same goes for a complete
    client.on("update", (t) => {
        // Given the todo, set it's 'complete' value to true
        const newDB = DB.map( (item) => {
            if (item.id === t.id) {
                item.completed = true;
            }
            return item;
        });
        // Set the DB to the appropriate array
        DB = newDB;
    });
    
    // Set all todo's to complete
    client.on('completeAll', () => {
        const newDB = DB.map( (item) => {
            item.completed = true;
            return item;
        });
        // Set the DB to the appropriate array
        DB = newDB;
    });
    
    // Delete all todo's
    client.on('deleteAll', () => {
        DB = [];
        reloadTodos();
    });
    
    // Send the DB downstream on connect
    reloadTodos();
});