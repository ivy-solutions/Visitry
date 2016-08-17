/**
 * Created by sarahcoletti on 8/15/16.
 */
import { Meteor } from 'meteor/meteor';
import winston from "winston";

let console = new winston.transports.Console({
  name: "console",
  timestamp: true
});
let logFile = new winston.transports.File({
  filename: "visitry.log",
  timestamp: true
});

export const logger = new winston.Logger({
  level: 'verbose',
  transports: [
    console,
    logFile
  ]
});
