import {LitElement, html, css} from 'lit';

export class TodoList extends LitElement {
  static properties = {
    listItems: {},
    hideCompleted: {}
  }

  static styles = css`
    li {
      font-size: 1.2rem;
    }
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
    input {
      font-size: 1.2rem
    }
    button {
      padding: 0.25rem;
      font-size: 1rem
    }
  `;

  constructor() {
    super()
    this.listItems = []
		this.hideCompleted = false
  }

  render() {
    const items = this.hideCompleted
    ? this.listItems.filter((item) => !item.completed)
    : this.listItems

    return html`
      <h1>Todo List</h1>
      <ul>
        ${items.map((item) =>
          html`<li class=${item.completed ? 'completed' : ''} @click=${() => this.toggleCompleted(item)}>${item.text}</li>`
        )}
      </ul>
      <input id="todo-newitem" placeholder="Something to do...">
      <button @click=${this.addTodo}>Add</button>
      <label>
        Hide completed
        <input type="checkbox" @change=${this.handleHideCompletedChange} .checked=${this.hideCompleted}/>
      </label>
    `;
  }

  toggleCompleted(item) {
    item.completed = !item.completed
    this.requestUpdate()
  }

  addTodo() {
    this.listItems.push({text: this.input.value, completed: false});
    this.input.value = '';
    this.requestUpdate();
  }

  get input() {
    return this.renderRoot?.querySelector('#todo-newitem') ?? null;
  }

	handleHideCompletedChange(event) {
		const input = event.target
		this.hideCompleted = input.checked
	}
}
