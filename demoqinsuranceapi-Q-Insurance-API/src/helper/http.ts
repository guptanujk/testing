import axios from 'axios';
const request = require('request');

const fireHttpRequest = async (options: any) => {
  return new Promise((resolve, reject) => {
    return axios(options)
      .then((response) => {
        resolve(response);
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

const fireHttpRequestForAV = async (options: any, tool: string) => {
  return new Promise((resolve, reject) => {
    if (tool !== 'saucelabs' && tool !== 'teamcity') {
      return axios(options)
        .then((response) => {
          resolve(response);
        })
        .catch(function (err) {
          reject(err);
        });
    } else {
      options.headers= {
        'Accept' : 'application/json',
      }
      request.get(options, (er: any, res: any) => {
        if (er) reject(er);
        else {resolve(res);}
      });
    }
  });
};


export default {
  fireHttpRequest,
  fireHttpRequestForAV
};
