import path from "path"
import url from "url"
import fs from "fs"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url)).slice(0, -10)

// Load environment variables.
const load = path => {
   const env = JSON.parse(fs.readFileSync(path))

   Object.keys(env).forEach(key => {
      global[key] = env[key]
   })

   return env
}

export const env = load(path.resolve(__dirname + "/environment.json"))

export const read = filename => {
   try { return fs.readFileSync(path.resolve(__dirname + "/public/" + filename)).toString() } catch (error) { return undefined }
}