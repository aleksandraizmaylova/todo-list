function createElement(tag, attributes, children, callbacks = {}) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "checked") {
        element.checked = !!value;
      } else if (key === "value") {
        element.value = value || "";
      } else if (value !== undefined && value !== null) {
        element.setAttribute(key, value);
      }
    });
  }

  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
          element.appendChild(child);
        }
      });
    } else if (typeof children === "string") {
      element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
      element.appendChild(children);
    }
  }

  if (callbacks) {
    Object.entries(callbacks).forEach(([event, handler]) => {
      if (handler) element.addEventListener(event, handler);
    });
  }

  return element;
}

class Component {
  constructor() {}

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }

  update() {
    const newDom = this.render();
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.replaceWith(newDom);
    }
    this._domNode = newDom;
  }
}

class AddTask extends Component {
  constructor(onAddTask) {
    super();
    this.onAddTask = onAddTask;
    this.state = { newTodo: "" };
  }

  onInputChange(e) {
    this.state.newTodo = e.target.value;
  }

  addTask() {
    const text = this.state.newTodo.trim();
    if (text) {
      this.onAddTask(text);
      this.state.newTodo = "";
      this.update();
    }
  }

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement("input", {
        id: "new-todo",
        type: "text",
        placeholder: "Задание",
        value: this.state.newTodo
      }, null, { input: (e) => this.onInputChange(e) }),
      createElement("button", { id: "add-btn" }, "+", { click: () => this.addTask() }),
    ]);
  }
}

class Task extends Component {
  constructor(todo, index, onToggle, onDelete) {
    super();
    this.todo = todo;
    this.index = index;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.state = { confirmDelete: false };
  }

  handleDelete() {
    if (this.state.confirmDelete) {
      this.onDelete(this.index);
    } else {
      this.state.confirmDelete = true;
      this.update();
    }
  }

  render() {
    return createElement("li", {}, [
      createElement("input", {
        type: "checkbox",
        checked: this.todo.completed
      }, null, { change: () => this.onToggle(this.index) }),
      createElement("label", {
        style: this.todo.completed ? "color: gray; text-decoration: line-through;" : ""
      }, this.todo.text),
      createElement("button", {
        style: this.state.confirmDelete ? "background-color: red;" : ""
      }, "🗑️", { click: () => this.handleDelete() })
    ]);
  }
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      todos: [
        { text: "Сделать домашку", completed: false },
        { text: "Сделать практику", completed: false },
        { text: "Пойти домой", completed: false }
      ]
    };
  }

  addTask(text) {
    this.state.todos.push({ text, completed: false });
    this.update();
  }

  toggleTodo(index) {
    this.state.todos[index].completed = !this.state.todos[index].completed;
    this.update();
  }

  deleteTodo(index) {
    this.state.todos.splice(index, 1);
    this.update();
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      new AddTask((text) => this.addTask(text)).getDomNode(),
      createElement("ul", { id: "todos" }, this.state.todos.map((todo, index) =>
          new Task(todo, index, (idx) => this.toggleTodo(idx), (idx) => this.deleteTodo(idx)).getDomNode()
      ))
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});