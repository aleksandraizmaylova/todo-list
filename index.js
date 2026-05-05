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

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      todos: [
        { text: "Сделать домашку", completed: false },
        { text: "Сделать практику", completed: false },
        { text: "Пойти домой", completed: false }
      ],
      newTodo: ""
    };
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          value: this.state.newTodo
        }, null, { input: (e) => this.onInputChange(e) }),
        createElement("button", { id: "add-btn" }, "+", { click: () => this.addTask() }),
      ]),
      createElement("ul", { id: "todos" }, this.state.todos.map((todo, index) =>
        createElement("li", {}, [
          createElement("input", {
            type: "checkbox",
            checked: todo.completed
          }, null, { change: () => this.toggleTodo(index) }),
          createElement("label", {
            style: todo.completed ? "color: gray; text-decoration: line-through;" : ""
          }, todo.text),
          createElement("button", {}, "🗑️", { click: () => this.deleteTodo(index) })
        ])
      )),
    ]);
  }

  onInputChange(e) {
    this.state.newTodo = e.target.value;
  }

  addTask() {
    const text = this.state.newTodo.trim();
    if (text) {
      this.state.todos.push({ text, completed: false });
      this.state.newTodo = "";
      this.update();
    }
  }

  toggleTodo(index) {
    this.state.todos[index].completed = !this.state.todos[index].completed;
    this.update();
  }

  deleteTodo(index) {
    this.state.todos.splice(index, 1);
    this.update();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});