/*
  @Author: Tushar Mohan 
  @Date: 2018-10-21 14:08:39 
 */

import apiConfig, { serviceConstants } from './../../config/apiConfig';
import send from './worker';

const envKeyName = serviceConstants.isProdEnabled ? 'prod' : 'dev';

const loadConfigWithKey = keyName => {
  const arrayOfKeys = keyName.trim().split('-');
  let errorStatusMsg = '';
  let previousLevelKey = 'apiConfig';
  let currentConfigLevel = apiConfig;
  for (const key of arrayOfKeys) {
    if (currentConfigLevel.hasOwnProperty(key)) {
      currentConfigLevel = currentConfigLevel[key];
      previousLevelKey = key;
    } else {
      errorStatusMsg =
        'Could not find key "' +
        key +
        '" inside "' +
        previousLevelKey +
        '" object for (' +
        keyName +
        '). Check if you have used the right seperator format or verify the configuration in apiConfig if the key-value pair exists.';
      break;
    }
  }

  if (errorStatusMsg) throw errorStatusMsg;

  return currentConfigLevel;
};

const optimise = fn => {
  let cache = {};
  return (...args) => {
    let argKey = args[0]; //update the logic if we need to support multiple arguments
    let result = (cache[argKey] = cache[argKey] || fn(...args));
    return result;
  };
};

const optimisedloadConfigWithKey = optimise(loadConfigWithKey);

const prepareResourcePath = (resource = '/', resourceConfig = {}) => {
  let processedRes = resource;
  for (const key in resourceConfig) {
    processedRes = processedRes.replace(':' + key, resourceConfig[key]);
  }
  const resPath = serviceConstants.baseURL[envKeyName] + processedRes;
  return resPath;
};

const addQueryParamsToReq = (resourceURL = '', query = {}) => {
  if (Object.keys(query).length < 1) return resourceURL;
  const queryString = Object.keys(query)
    .reduce(function(accumulator, currentValue) {
      accumulator.push(currentValue + '=' + encodeURIComponent(query[currentValue]));
      return accumulator;
    }, [])
    .join('&');

  return resourceURL + '?' + queryString;
};

const request = (resourceIdentifier, config = {}) => {
  const res = optimisedloadConfigWithKey(resourceIdentifier);
  if (!res.isEnabled) {
    throw new Error(
      'Trying to access an endpoint which has been disabled. Requested resource : (' +
        resourceIdentifier +
        '). Please enable endpoint or udpate api config to access the resource.'
    );
  }
  const resourcePath = prepareResourcePath(res.endPoint, config.options || {});
  const resourcePathWithQeury = addQueryParamsToReq(resourcePath, config.query);
  const resourceHeaders = Object.assign({}, config.headers, serviceConstants.commonHeaders);
  const reqMethod = res.method || 'GET';
  const reqBody = config.body || {};

  return send(
    resourcePathWithQeury,
    resourceHeaders,
    reqMethod,
    reqBody,
    res.timeOut || serviceConstants.timeOut
  );
};

export { request };
