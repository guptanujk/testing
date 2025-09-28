import log4js from 'log4js';
import logConfig from './logConfig';


if (process.env.NODE_ENV && process.env.NODE_ENV == 'test') {
  log4js.configure(logConfig.test);
} else if (process.env.NODE_ENV == 'localhost') {
  log4js.configure(logConfig.local);
} else {
  log4js.configure(logConfig.prod);
}

export const logger = log4js.getLogger('TED');