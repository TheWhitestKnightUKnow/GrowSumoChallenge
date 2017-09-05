const server = io('http://localhost:3003');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    const input = document.getElementById('todo-input');

    // Emit the new todo as some data to the server
    server.emit('make', {
        title : input.value
    });
    console.warn(input.value);
    // Clear the input
    input.value = '';
    // Refocus on the input
    input.focus();
}

// TODO: Create a delete function to remove things from
// the 'database'
function remove(todo) {
    list.removeChild(todo);
    server.emit('delete', todo); // todo.value?
}

// TODO: Create a complete function that denotes tasks as
// completed
function update(todo) {
    
}

function render(todo) {
    console.log(todo);
    const listItem = document.createElement('li');
    const listItemText = document.createTextNode(todo.title);
    listItem.appendChild(listItemText);
    list.append(listItem);
}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
// ** This could use data, maybe?
server.on('load', (todos) => {
    todos.forEach((todo) => render(todo));
});
