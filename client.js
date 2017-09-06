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
function update(e) {
    console.log(e);
    server.emit('update', e);
}

function render(todo) {
    console.log(todo);
    // Create the parent list item
    const listItem = document.createElement('li');
    // Create the 'completed' checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('onclick', 'update(event)');
    // Set the contents of the list item
    const listItemText = document.createTextNode(todo.title);
    // Attach the checkbox and the title to the list item
    listItem.appendChild(checkbox);
    listItem.appendChild(listItemText);
    // Attach the item to the list
    list.append(listItem);
}

// When you press enter on the todo-input
function onEnter(e) {
    if (e.keyCode === 13){
        this.add();
    }
}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    // For now, this will reset the todos to be equal to
    // DB when we reload.  TODO: Could still make reload 
    // more efficient.
    list.innerHTML = "";
    todos.forEach((todo) => render(todo));
});
