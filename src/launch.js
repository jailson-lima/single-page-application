import os from "os"
import process from "process"
import cluster from "cluster"

const CPUS = os.cpus()

if (cluster.isPrimary) {
   console.log(`[x] primary ${process.pid}`)

   for (let i = 0; i < CPUS.length; i++) {
      cluster.fork()
   }

   cluster.on("listening", worker => console.log(`[x] worker ${worker.process.pid} listening`))

   cluster.on("disconnect", worker => console.log(`[x] worker ${worker.process.pid} disconnect`))

   cluster.on("exit", worker => {
      console.log(`[x] worker ${worker.process.pid} exit`)
      cluster.fork()
   })
}
else {
   console.log(`[x] worker ${process.pid}`)
   import("./application.js")
}