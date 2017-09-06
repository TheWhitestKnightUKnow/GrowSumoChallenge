const uuidV4 = require('uuid/v4');

module.exports = class Todo {
    constructor(title='') {
        // The todo's id
        this.id = uuidV4();
        // The title (and content) of the todo
        this.title = title;
        // Whether this todo has been completed or not
        this.completed = false;
    }
};
