/**
 * Created by sarahcoletti on 8/16/16.
 */
import { Winston } from "meteor/brentjanderson:winston-client"

export const logger = {
  info: Winston.info,
  warn: Winston.warn,
  error: Winston.error
};