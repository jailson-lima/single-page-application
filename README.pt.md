# Single-Page Application

Este repositório contem um _servidor de arquivos estáticos_ e um _template frontend_ para projetos do tipo **single-page application** (SPA), desenvolvido em **JavaScript Vanilla** (sem framework).

> [English version](https://github.com/jailson-math/single-page-application/README.md)

## Estrutura do projeto

A organização do _template frontend_ com a _Single-Page Application_ fica dentro da pasta `public`.

```
├── public
│   ├── css
│   │   ├── main.css
│   ├── fonts
│   ├── images
│   ├── js
│   │   ├── application.js
│   │   ├── components.js
│   │   ├── core.js
│   ├── index.html
```

### `index.html`

Contem a marcação global e também é o ponto de partida da aplicação. Deve conter 3 itens:

- Um elemento `link` para o `main.css`.
   ```html
   <link rel="stylesheet" href="/css/main.css">
   ```
- Um elemento `div` com o `id` da aplicação.
   ```html
   <div id="app"></div>
   ```
- Um elemento `script` para o `application.js`.
   ```html
   <script type="module" src="/js/application.js"></script>
   ```

### `main.css`

O arquivo `main.css` contem o _CSS_ principal da aplicação, mas podem ser adicionados outros.

### `application.js`

Contem o código principal da aplicação.

```javascript
import { Application, View } from "./core.js"

class SingleView extends View {
   constructor() {
      super("single-view", "Single View")
   }
}

const routes = [
   {path: "/", view: SingleView}
]

const app = new Application("app")
app.routes = routes
app.run()
```

No código acima criamos um objeto `Application`, que representa a _SPA_, passando para o seu construtor o mesmo valor do `id` do elemento `div#app` declarado em `index.html`.

### Rotas

As _rotas_ são definidas no array `routes`, como por exemplo:

```javascript
const routes = [
   {path: "/", view: Dashboard},
   {path: "/task", view: Task},
   {path: "/settings", view: Settings},
]
```

**Roteamento**:

O acesso as _views_ pelas rotas pode ser feito na marcação através de um elemento `a` com o atributo `data-link`:

```html
<ul>
   <li><a href="/" data-link>Dashboard</a></li>
   <li><a href="/task" data-link>Task</a></li>
   <li><a href="/settings" data-link>Settings</a></li>
</ul>
```

No código através do método `navigate(url)` disponível em toda a aplicação através do **objeto global** `app`:

```javascript
app.navigate("/task")
```

Ou digitando a _URL_ completa da rota na _barra de endereço_ do navegador. Por exemplo:

```
http://localhost:3000/tasks
```

**Ancoragem através da hash na URL:**

A ancoragem em um elemento com `id` igual a `hash` da _URL_ pode ser feita de três formas:

1. Diretamente pela **barra de endereço** do navegador, digitando a _URL_:
   ```
   http://localhost:3000/task#new-task
   ```
2. Dentro da **mesma view**. Nesse caso utilizamos um elemento `a` simples, sem o atributo `data-link`:
   ```html
   <a href="#new-task">New Task</a>
   ```
3. Para **outra view**. Nesse caso é necessário utilizar um elemento `a` com o atributo `data-link`:
   ```html
   <a href="/task#new-task" data-link>New Task</a>
   ```
   ou utilizar o método `navigate(url)` no código:
   ```javascript
   app.navigate("/task#new-task")
   ```

### Core

O núcleo de funcionamento da _SPA_ está definido dentro do arquivo `core.js`. É nele que estão definidas as funções básicas da _SPA_, como por exemplo, **roteamento** e **renderização de views**. Tudo o que é necessário fazer para criar uma _SPA_ é importar as classes `Application` e `View` de `core.js`.

```javascript
/* Resolve the URL. */
const resolveURL = url => {
   url = url.replace(/\/{2,}/g, "/") // Replaces multiple "/" characters with just one.
   if (url.length > 2)
      url = url.replace(/\/$/g, "")  // Remove the final "/" character.
   return url
}

/* Generates regular expression for the URL. */
const regexURL = url => {
   url = url.replace(/\[[^\/]+\]/g, "([\\w\\-]+)") // Finds parameter patterns [...] and replaces with groups (...).
   return "^" + url.replace(/\//g, "\\/") + "$"    // Assembles the regular expression.
}

/* Get the pathname, search and hash of the URL. */
const parseURL = url => {   
   let pathname = url
   let search = ""
   let hash = ""

   let index_hash = url.indexOf("#")

   if (index_hash != -1) {
      hash = url.slice(index_hash)
      pathname = url.slice(0, index_hash)
   }

   let index_search = pathname.indexOf("?")

   if (index_search != -1) {
      search = pathname.slice(index_search)
      pathname = pathname.slice(0, index_search)
   }

   return [pathname, search, hash]
}

/* Get URL params. */
const getParams = (route, url) => {
   let matches = url.match(route.regex)
   if (matches) {
      const keys = Array.from(route.path.matchAll(/\[([^\/]+)\]/g)).map(result => result[1])
      const values = matches.slice(1)
      return Object.fromEntries(keys.map((key, i) => [key, values[i]]))
   }
   else {
      return {}
   }
}

/* Get the queries from the search. */
const getQueries = search => {
   const queries = search.split("?").filter(result => result != "")
   return Object.fromEntries(queries.map(query => query.split("=")))
}

/* Route security. */
const routeSecurity = route => {
   let blocked = false
   let next = undefined

   if (app.security)
      [blocked, next] = app.security(route)

   return [blocked, next]
}

/* Make the change of route. */
const changeRoute = async () => {
   const router = app.router

   if (router.routes.length == 0) {
      return
   }

   router.pathname = resolveURL(location.pathname)
   router.search = location.search
   router.hash = location.hash
   router.queries = getQueries(router.search)

   router.previous_route = router.route
   router.route = router.routes.find(route => router.pathname.match(route.regex))

   if (!router.route) {
      router.route = router.routes[0]
      router.pathname = router.route.path
   }

   router.params = getParams(router.route, router.pathname)

   if (router.route != router.previous_route) {
      if (router.previous_route)
         router.previous_route.view.outside()

      // Route security.
      let blocked, next
      [blocked, next] = routeSecurity(router.route)

      if (!blocked) { // Route released.
         router.route.view.inside()
      }
      else if (next) { // Route blocked with redirection.
         let pathname, search, hash

         [pathname, search, hash] = parseURL(next)
         pathname = resolveURL(pathname)

         let route = router.routes.find(route => pathname.match(route.regex))

         if (route) {
            router.pathname = pathname
            router.search = search
            router.hash = hash
            router.queries = getQueries(router.search)
            router.route = route
            router.params = getParams(router.route, router.pathname)
            router.route.view.inside()
         }
         else {
            app.redirect(next)
         }
      }
      else { // Route blocked.
         document.title = router.route.view.title
      }

      if (app.onroute)
         app.onroute(router.route)
   }

   const url = router.pathname + router.search + router.hash
   history.replaceState(null, null, url)
}

/* Scrolls to element with id equal to hash. */
const scrollHash = async id => {
   try { document.querySelector(id).scrollIntoView() } catch (error) {}
}

/* Navigate to URL. */
const navigate = url => {
   history.pushState(null, null, url)
   changeRoute()
   scrollHash(location.hash)
}

/* Redirect to URL. */
const redirect = url => {
   window.location.href = url
}

/* Application model. */
export class Application {
   constructor(id) {
      this.element = document.querySelector("#" + id)
      this.routes = []
      this.router = null
      this.views = {} // Views of routes.
      this.onroute    // Asynchronous callback function executed when route changes.
      this.security   // Callback function executed to check the security of the route.

      // Sets the app global variable.
      window.app = this
   }

   run() {
      this.router = new Router(this.routes)
   }

   navigate(url) {
      navigate(url)
   }

   redirect(url) {
      redirect(url)
   }

   get route() {
      if (this.router)
         return this.router.route
   }

   get pathname() {
      if (this.router)
         return this.router.pathname
   }

   get search() {
      if (this.router)
         return this.router.search
   }

   get hash() {
      if (this.router)
         return this.router.hash
   }

   get params() {
      if (this.router)
         return this.router.params
   }

   get queries() {
      if (this.router)
         return this.router.queries
   }
}

/* Router model. */
export class Router {
   constructor(routes = []) {
      this.routes = routes // Registered routes.
      this.route = null    // Current route.
      this.previous_route  // Previous route.
      this.pathname = ""   // pathname.
      this.search = ""     // search.
      this.hash = ""       // hash.
      this.params = {}     // Parameters of the pathname.
      this.queries = {}    // Queries of the search.

      // Resolve path, generate regex and replaces view
      // classes with view objects for each route.
      for (let i = 0; i < this.routes.length; i++) {
         this.routes[i].path = resolveURL(this.routes[i].path)
         this.routes[i].regex = regexURL(this.routes[i].path)
         this.routes[i].view = new this.routes[i].view()
      }

      this.routing()
   }

   // Starts application routing.
   routing() {
      window.addEventListener("popstate", changeRoute)

      document.addEventListener("DOMContentLoaded", event => {
         document.body.addEventListener("click", event => {
            if (event.target.matches("[data-link]")) {
               event.preventDefault()
               navigate(event.target.href)
            }
         })
         changeRoute()
      })
   }
}

/* View model. */
export class View {
   constructor(id, title) {
      this.element = document.querySelector("#" + id)
      this.element.style.display = "none"
      this.title = title || document.title

      // Sets reference in global variable app.
      window.app.views[id] = this
   }

   // Executed whenever the view enters the scene.
   async inside() {
      this.element.style.display = "block"
      document.title = this.title
   }

   // Executed whenever the view exits the scene.
   async outside() {
      this.element.style.display = "none"
   }
}
```