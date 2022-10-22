import winston from "winston"

const __logger__ = winston.createLogger({
   format: winston.format.combine(
      winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
      winston.format.json()
   ),
   transports: [
      new winston.transports.File({filename: "info.log", level: "info"})
   ]
})

const info = request => {
   __logger__.info({endpoint: request.method + " " + request.url})
}

export const logger = {info}

global.logger = logger