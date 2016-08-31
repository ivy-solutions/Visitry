/**
 * Created by sarahcoletti on 8/16/16.
 */
import "meteor/brentjanderson:winston-client"

var logger = {
  verbose: Winston.info,  //FIX-ME I have not been able to get verbose or debug to log as such
  debug: Winston.info,
  info: Winston.info,
  warn: Winston.warn,
  error: Winston.error
};

export {logger}