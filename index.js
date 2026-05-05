function createElement(tag, attributes, children, callbacks = {}) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

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

  if (callbacks) {
    Object.entries(callbacks).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }

  return element;
}

class Component {
  constructor() {
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      todos: [
        { text: "Сделать домашку" },
        { text: "Сделать практику" },
        { text: "Пойти домой" }
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
        }, { input: this.onAddInputChange }),
        createElement("button", { id: "add-btn" }, "+", { input: this.onAddInputChange }),
      ]),

      createElement("ul", { id: "todos" }, this.state.todos.map((todo) =>
          createElement("li", {}, [
            createElement("input", { type: "checkbox" }),
            createElement("label", {}, todo.text),
            createElement("button", {}, "🗑️")
          ])
      )),
    ]);
  }

  onAddTask(e) {
    this.state.newTodo = e.target.value;
  }

  onAddInputChange() {
    const text = this.state.newTodoText.trim();
    if (text) {
      this.state.todos.push({ text });
      this.state.newTodoText = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});


