/*
  @Author: Tushar Mohan 
  @Date: 2018-10-20 13:44:43 
 */

import { NetInfo } from 'react-native';
import Log, { networkRequestLogger } from './../logging';

const webServiceWatcher = (function() {
  const memoryEl = {};
  memoryEl.isServiceAvailable = true;
  memoryEl.networkType = '';
  NetInfo.addEventListener('connectionChange', networkType => {
    memoryEl.isServiceAvailable = networkType !== 'none';
    memoryEl.networkType = networkType;
    Log.debug(memoryEl);
  });
  return memoryEl;
})();

const requestBuilder = (header, method = 'GET', body) => {
  var options = {};
  options['method'] = method.toUpperCase();

  if (method !== 'GET') {
    options['body'] = JSON.stringify(body);
  }
  options['headers'] = header;

  return options;
};

const handleTimeOut = (timeOut, promise) => {
  return new Promise(function(resolve, reject) {
    if (!webServiceWatcher.isServiceAvailable) {
      reject({ name: '503', message: 'No Internet connection' });
    } else {
      setTimeout(() => {
        //this gets called even if the request thing has been successful.. but since the success would have been already,
        //context of the requesting object will go out of scope... :)
        reject({ name: '503', message: 'Request timed out' });
      }, timeOut);
      promise.then(resolve, reject);
    }
  });
};

const processResponse = (response, isError) => {
  return new Promise(function(resolve, reject) {
    if (!isError) {
      const resp = response.json();
      if (!response.ok) {
        return reject({
          name: response.status,
          message: 'HTTP Request Failed',
          value: resp
        });
      } else {
        resolve(resp);
      }
    } else {
      reject(response);
    }
  });
};

const send = (URI, header, method, body, timeOut) => {
  const request = requestBuilder(header, method, body);
  describeRequest(request, URI);

  return handleTimeOut(timeOut, fetch(URI, request))
    .then(response => {
      return processResponse(response, false);
    })
    .catch(error => {
      return processResponse(error, true);
    });
};

const describeRequest = (requestObject, resourceName) => {
  networkRequestLogger(requestObject, resourceName);
};

export default send;
