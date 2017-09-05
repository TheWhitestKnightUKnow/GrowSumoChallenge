const server = require('socket.io')();
// ** We probably wanna use this data file.  Be mindful of multi-access!
// ** Might need to get locks involved.
const firstTodos = require('./data');
const Todo = require('./todo');

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // Found this cool idea online to use a flag
    // to tell if the server has been reset or not
    let serverStarted = false;
    
    // First, we start the DB off empty
    let DB = [];
    
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
        const newDB = DB.filter((element) => {
            return element.title !== t.title;
        });
        
        DB = newDB;

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
