const server = io('http://localhost:3003');
const list = document.getElementById('todo-list');
var cache = [];

// We start off connected to the server, but
// if our connection breaks we can use this flag
// to tell our client/UI that we're stranded
var connection_error = false;

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
        title: todo.innerText
    });
}

// Completes all todo's
function completeAll() {
    var lis = list.getElementsByTagName("li");
    for (var i = 0; i < lis.length; ++i) {
        // This is a super ugly version of
        // if (!lis[i].hasClass('completed')) {
        // because we lack jQuery
        if ((" " + lis[i].className + " ").replace(/[\n\t\r]/g, " ").indexOf('completed') < 0) {
            lis[i].classList.toggle('completed');
        }
    }
    server.emit('completeAll');
}

// Delete's all current todo's
function deleteAll() {
    server.emit('deleteAll');
}

// Add a listener to the todo-list, so that when
// a todo is clicked on, it becomes completed
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('completed');
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
    list.innerHTML = "";
    localStorage.setItem('cache', JSON.stringify(todos));
    todos.forEach((todo) => render(todo));
});

// Listening for a single event being added
server.on('loadSingle', (todo) => {
    render(todo);
});

// When the server connections is broken,
// load the todos from the cache
server.on('connect_error', () => {
    // At this point, we haven't had a connection error before
    if (!connection_error) {
        var todos = JSON.parse(localStorage.cache);
        list.innerHTML = "";
        todos.forEach((todo) => render(todo));
    }
    // But now we have!
    connection_error = true;
});