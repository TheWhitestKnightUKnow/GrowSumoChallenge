const server = require('socket.io')();
// ** We probably wanna use this data file.  Be mindful of multi-access!
// ** Might need to get locks involved.
const firstTodos = require('./data.json');
const Todo = require('./todo.js');

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // FIXME: DB is reloading on client refresh. It should be persistent on new client
    // connections from the last time the server was run...
    // (Switched from const to var, so we can filter out todos.)
    var DB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(t.title);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        server.emit('load', DB);
    };

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);

        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        // ** Sure, could send only the newly made todo(s)
        reloadTodos();
    });
    
    // TODO: This is a mock-up of what I imagine the delete
    // function will be like
    client.on('delete', (t) => {
        // Given the todo, delete it from the list
        // FIXME: This will delete any Todo with the same
        // title contents.  This should only delete the selected
        // Todo.
        DB = DB.filter((element) => {
            return element.title != t.title
        });

        // Send the latest todos to the client
        // Same FIXME as above!
        reloadTodos();
    });
    
    // TODO: Same goes for a 
    client.on("complete", (t) => {
        // Given the todo, set it's 'complete' value to true
        DB = DB.map((element) => {
            if (element == t) {
                element.completed = true;
            }
            return element;
        });
    });

    // Send the DB downstream on connect
    reloadTodos();
});

console.log('Waiting for clients to connect');
server.listen(3003);
