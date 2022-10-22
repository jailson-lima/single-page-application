/*
Created by Jailson Lima and released under the MIT License.
HTTP Static Server for frontend projects.
*/

import express from "express"
import https from "https"
import cors from "cors"
import path from "path"
import url from "url"
import fs from "fs"
import { env, read } from "./utilities/utilities.js"
import { logger } from "./services/logger.js"

const app = express()
app.use(express.text())
app.use(express.json())
app.use(cors())

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const page_index = read("index.html")
const page_error = read("404.html")

// Middleware Error.
app.use((error, request, response, next) => {
   console.log(request.method, request.url)

   if (error instanceof SyntaxError && error.status == 400) {
      // 400 Bad Request
      response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }
   else if (error.status == 500) {
      // 500 Internal Server Error
      response.status(500).send({
         status: 500,
         message: "Internal Server Error"
      })
   }
})

// Middleware Redirect.
app.use((request, response, next) => {
   if (request.secure)
      next()
   else
      response.redirect(301, "https://" + request.headers.host.replace(PORT, PORT_HTTPS) + request.url)
})

app.use((request, response, next) => {
   console.log(request.method, request.url)
   logger.info(request)
   next()
})

// Static files.
app.use(express.static(path.resolve(__dirname, "public")))

// Middleware Custom Not Found.
app.use((request, response) => {
   // If it's a directory, send the index.html page and let
   // the single-page application do the virtual routing.
   if (request.url.indexOf(".") == -1)
      response.status(200).send(page_index || "<pre></pre>")
   else
      response.status(404).send(page_error || "<pre>" + request.method + " " + request.url + " Not Found" + "</pre>")
})

app.listen(PORT, () => {
   console.log("http://localhost:" + PORT)
})

// SSL (Secure Sockets Layer) options.
const options = {
   key: fs.readFileSync(path.resolve(__dirname, "SSL/certificate.key")),
   cert: fs.readFileSync(path.resolve(__dirname, "SSL/certificate.crt"))
}

const server = https.createServer(options, app)

server.listen(PORT_HTTPS, () => {
   console.log("https://localhost:" + PORT_HTTPS)
})