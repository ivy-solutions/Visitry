/**
 * Created by sarahcoletti on 8/15/16.
 */
import winston from "winston";
import {DailyRotateFile} from "winston-daily-rotate-file";

let consoleLog = new winston.transports.Console({
  name: "console",
  timestamp: true
});

// not working - due to permissions on /var/log
let logFile = new winston.transports.File({
  name: "logfile",
  filename: '/var/log/visitry.log',
  timestamp: true
}).on('error', function(err) {
  console.log(err.stack);
});

//Note: This will create a log file in the default run directory.
// When running locally that file will be, e.g., : Visitry/.meteor/local/build/programs/server/2016-08-17.visitry.log
// If we want to put this in some more accessible place we need to get the permissions on that directory right and edit the filename below
let fileRotate = new winston.transports.DailyRotateFile({
  name: 'file',
  datePattern: '.yyyy-MM-dd', //rotates daily at midnight
  filename: 'visitry.log',
  prepend: true //prepend rolling time of file
}).on('error', function(err) {
  console.log(err.stack);
});

let logger = new winston.Logger({
  level: 'debug',
  transports: [
    consoleLog,
    fileRotate
  ],
  exitOnError: false
});

export {logger }