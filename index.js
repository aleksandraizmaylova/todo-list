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
        value: this.state.newTodo,
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

  updateProps(todo, index, onToggle, onDelete) {
    this.todo = todo;
    this.index = index;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.update();
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
        checked: this.todo.completed,
      }, null, { change: () => this.onToggle(this.index) }),
      createElement("label", {
        style: this.todo.completed ? "color: gray; text-decoration: line-through;" : "",
      }, this.todo.text),
      createElement("button", {
        style: this.state.confirmDelete ? "background-color: red;" : "",
      }, "🗑️", { click: () => this.handleDelete() }),
    ]);
  }
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      todos: this.loadFromLocalStorage() || [
        { id: this.generateId(), text: "Сделать домашку", completed: false },
        { id: this.generateId(), text: "Сделать практику", completed: false },
        { id: this.generateId(), text: "Пойти домой", completed: false },
      ],
    };
    this.taskComponents = [];
    this.addTaskComponent = new AddTask((text) => this.addTask(text));
    this.syncTasks();
  }

  generateId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  }

  saveToLocalStorage() {
    localStorage.setItem('todoListData', JSON.stringify(this.state.todos));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('todoListData');
    if (data) {
      const todos = JSON.parse(data);
      return todos.map(todo => todo.id ? todo : { ...todo, id: this.generateId() });
    }
    return null;
  }

  syncTasks() {
    const newTaskComponents = [];
    const oldComponentsMap = new Map();
    this.taskComponents.forEach(comp => oldComponentsMap.set(comp.todo.id, comp));

    this.state.todos.forEach((todo, idx) => {
      if (oldComponentsMap.has(todo.id)) {
        const existingComp = oldComponentsMap.get(todo.id);
        existingComp.updateProps(todo, idx, (i) => this.toggleTodo(i), (i) => this.deleteTodo(i));
        newTaskComponents.push(existingComp);
      } else {
        const newComp = new Task(todo, idx, (i) => this.toggleTodo(i), (i) => this.deleteTodo(i));
        newTaskComponents.push(newComp);
      }
    });

    this.taskComponents = newTaskComponents;
  }

  addTask(text) {
    const newTodo = {
      id: this.generateId(),
      text,
      completed: false,
    };
    this.state.todos.push(newTodo);
    this.saveToLocalStorage();
    this.syncTasks();
    this.update();
  }

  toggleTodo(index) {
    this.state.todos[index].completed = !this.state.todos[index].completed;
    this.saveToLocalStorage();
    this.syncTasks();
    this.update();
  }

  deleteTodo(index) {
    this.state.todos.splice(index, 1);
    this.saveToLocalStorage();
    this.syncTasks();
    this.update();
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      this.addTaskComponent.getDomNode(),
      createElement("ul", { id: "todos" },
        this.taskComponents.map(comp => comp.getDomNode())
      ),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});