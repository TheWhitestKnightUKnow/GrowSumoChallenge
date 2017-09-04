module.export = class Todo {
    constructor(title='') {
        // The title (and content) of the todo
        this.title = title;
        // Whether this todo has been completed or not
        this.completed = false;
    }
}
