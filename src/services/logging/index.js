/*
  @Author: Tushar Mohan 
  @Date: 2018-10-16 11:17:46 
 */

const isDevelopmentEnvironment =
  console.group &&
  process.env.NODE_ENV !== 'production' &&
  String.prototype.padStart &&
  console.groupCollapsed;

/**
 * Do not use reduxLogger as a logging utility.This works as a helper to Redux for logging dispatched actions.
 * For general logging, use Log.
 */
const ReduxLogger = store => next => action => {
  if (!isDevelopmentEnvironment) return next(action);

  const storeState = store.getState();
  const isAnObject = typeof storeState === typeof {};
  const shouldShowAsTable = storeState && isAnObject;

  if (action.asyncTask) return next(action);

  console.group(action.type);
  if (shouldShowAsTable) {
    console.table(storeState);
  } else {
    console.log('%c Prev State:', 'color:gray', store.getState());
  }
  console.log('%c Action Info:', 'color:green', action);
  console.groupEnd(action.type);
  next(action);
};

const LogLevels = () => ({
  info: { priority: 1, flagColor: '#39A9DB', flagString: 'INFO' },
  debug: { priority: 5, flagColor: '#00BD9D', flagString: 'DEBUG' },
  warn: { priority: 10, flagColor: '#f4df6d', flagString: 'WARN' },
  error: { priority: 15, flagColor: '#FF5E5B', flagString: 'ERROR' }
});

const generateTimeStamp = () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDate().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString();
  const currentYear = currentDate.getFullYear();
  const formattedDate = `${currentDay.padStart(2, '0')}-${currentMonth.padStart(
    2,
    '0'
  )}-${currentYear}`;
  const currentHours = currentDate.getHours().toString();
  const currentMinutes = currentDate.getMinutes().toString();
  const currentSeconds = currentDate.getSeconds().toString();
  return `[${formattedDate} ${currentHours.padStart(2, '0')}:${currentMinutes}:${currentSeconds}]`;
};

const logToConsole = (flagColor, flagString, currentLogStatement, currentLogData) => {
  const styling = `font-weight:bold; color: ${flagColor};`;
  const currentTimeStamp = generateTimeStamp();

  const output = `%c${currentTimeStamp} - ${flagString.padEnd(5)}:%c ${currentLogStatement}`;
  console.log(output, styling, 'color:inherit;', currentLogData || '');
};

const prepareToLog = (logStatement, logData, level = 'info') => {
  if (!isDevelopmentEnvironment) {
    return;
  }

  const currentLogLevel = level;
  let currentLogStatement = logStatement;
  let currentLogData = logData;

  if (typeof currentLogStatement !== 'string') {
    currentLogData = currentLogStatement;
    currentLogStatement = '';
  }

  const { flagColor, flagString } = LogLevels()[currentLogLevel];

  logToConsole(flagColor, flagString, currentLogStatement, currentLogData);
  // TODO: Write logs to file for debugging
};

export default class Log {
  static info(stringData, objData) {
    prepareToLog(stringData, objData, 'info');
  }
  static debug(stringData, objData) {
    prepareToLog(stringData, objData, 'debug');
  }
  static warn(stringData, objData) {
    prepareToLog(stringData, objData, 'warn');
  }
  static error(stringData, objData) {
    prepareToLog(stringData, objData, 'error');
  }
}

export { ReduxLogger };

export const networkRequestLogger = (requestObject, resourceName) => {
  if (!isDevelopmentEnvironment) return;

  console.group('WEBSERVICE: REQUEST');
  console.log('URI: ' + resourceName);
  console.log('METHOD: ' + requestObject.method);

  console.groupCollapsed('HEADERS');
  console.log(requestObject.headers);
  console.groupEnd();

  if (requestObject.body) {
    console.group('BODY');
    console.log(requestObject.body);
    console.groupEnd();
  }

  console.groupEnd();
};
