import {TodoList} from "./components/todo-list"


window.addEventListener("DOMContentLoaded", async () => {
  customElements.define('todo-list', TodoList);
})

