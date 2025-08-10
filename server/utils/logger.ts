import * as winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "trpc.error.log", level: "error" }),
    new winston.transports.File({ filename: "trpc.log" }),
  ],
});
