import { Application, View } from "./core.js"
import { components } from "./components.js"

/* Global variables and functions. */

/* Startup components. */

components()

/* Define views. */

// Dashboard view.
class Dashboard extends View {
   constructor() {
      super("dashboard", "Dashboard")
   }

   async inside() {
      super.inside()
   }

   async outside() {
      super.outside()
   }
}

// Task view.
class Task extends View {
   constructor() {
      super("task", "Task")
   }

   async inside() {
      super.inside()
   }

   async outside() {
      super.outside()
   }
}

// TaskItem view.
class TaskItem extends View {
   constructor() {
      super("task-item", "Task Item")
      this.taskId = document.querySelector("#task-item__id")
   }

   async inside() {
      super.inside()
      this.taskId.textContent = app.params.id
   }

   async outside() {
      super.outside()
   }
}

// Settings view.
class Settings extends View {
   constructor() {
      super("settings", "Settings")
   }

   async inside() {
      super.inside()
   }

   async outside() {
      super.outside()
   }
}

/* Define routes. */

const routes = [
   {path: "/", view: Dashboard},
   {path: "/task", view: Task},
   {path: "/task/[id]", view: TaskItem},
   {path: "/settings", view: Settings},
]

const security = route => {
   let blocked = false
   let next = undefined

   // Security rules.

   return [blocked, next]
}

/* Create application. */

const app = new Application("app")
app.routes = routes
app.security = security
app.run()

app.onroute = async route => {
   console.log("route:", route)
}

console.log(app)