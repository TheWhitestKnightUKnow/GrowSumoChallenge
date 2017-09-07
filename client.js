const server = io('http://localhost:3003');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    const input = document.getElementById('todo-input');
    // Only make a new entry if input isn't blank
    if (input.value !== "") {
        // Emit the new todo as some data to the server
        server.emit('make', {
            title : input.value
        });
        // Clear the input
        input.value = '';
        // Refocus on the input
        input.focus();
    }
}

// A delete function to remove todos from
// the 'database'
function remove(todo) {
    list.removeChild(todo);
    server.emit('delete', {
        id: todo.id,
        title: todo.innerHTML
    });
}

// Updates a todo to "completed"
function update(todo) {
    server.emit('update', {
        id: todo.id,
        title: todo.innerHTML
    });
}

// Add a listener to the todo-list, so that when
// a todo is clicked on, it becomes completed
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
    update(ev.target);
  }
}, false);

function render(todo) {
    // Create the parent list item
    const listItem = document.createElement('li');
    listItem.id = todo.id;
    // Create an X for deleting todos
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("   x");
    span.className = "close";
    span.appendChild(txt);
    span.onclick = function() { remove(listItem); };
    // Set the contents of the list item
    const listItemText = document.createTextNode(todo.title);
    // Attach the title to the list item
    listItem.appendChild(listItemText);
    // Attach the X to the list item
    listItem.appendChild(span);
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

// Listening for a single event being added
server.on('loadSingle', (todo) => {
    render(todo);
});
