# redux-firebase-middleware [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

[![Greenkeeper badge](https://badges.greenkeeper.io/Canner/redux-firebase-middleware.svg)](https://greenkeeper.io/)
> redux middleware for firebase, support native web API or react-native-firebase API.

## Installation

```sh
$ npm install --save redux-firebase-middleware
```

## Usage

### Store

Setting up in your redux store

##### Web

```js
/** firebase web api **/
const {applyMiddleware, createStore, compose} = require('redux');
const {firMiddleware} = require('redux-firebase-middleware');

const config = {
  apiKey: 'xxxxxxxxxxx',
  authDomain: 'xxxxxxxxxxx',
  databaseURL: 'xxxxxxxxxxx',
  projectId: 'xxxxxxxxxxx',
  storageBucket: 'xxxxxxxxxxx',
  messagingSenderId: 'xxxxxxxxxxx',
};

firebase.initializeApp(config).database();

const finalCreateStore = compose(
  applyMiddleware(thunk),
  applyMiddleware(firMiddleware(firebase)) // -----> apply fir middleware in redux store
)(createStore);

```

##### React-native

```js
/** react-native-firebase native api **/
import RNFirebase from 'react-native-firebase';

const configOpts = {
  debug: true,
  persistence: true,
};

RNFirebase.initializeApp(configOpts);

const finalCreateStore = compose(
  applyMiddleware(thunk),
  applyMiddleware(firMiddleware(RNFirebase)) // -----> apply fir middleware in redux store
)(createStore);

.....

```

### action

dispatching a firMiddleware action.

- types: action constants types
- ref: firebase reference
- method: firebase get value method, support `once_value`, `once_child_added`, `once_child_changed`, `once_child_removed`, `once_child_moved`

```js
const {CALL_FIR_API} = require('redux-firebase-middleware');

function callAnAction() {
  return dispatch({[CALL_FIR_API]: {
    types: GET_MY_REF, // -----> normally this should put in constants, see `constants`(next seciton) for more info
    ref: 'my_firebase_ref/ref/ref', // ----> your firebase reference path
    method: 'once_value',
  }});
}
```

### Constants

##### Default payload

`data.val()` will return as default.

```js
export const GET_CALC_CAR_CATEGORY = [
  'GET_MY_REF_REQUEST', // -------> first, must be request type
  'GET_MY_REF_SUCCESS', // -------> second, must be success type
  'GET_MY_REF_FAILURE', // -------> third, must be failure type
];
```

##### Customized payload

```js
export const GET_CALC_CAR_CATEGORY = [
  'GET_MY_REF_REQUEST', // -------> first, must be request type
  {
    type: 'GET_MY_REF_SUCCESS', // ------> second, must be success type
    payload: (action: FirAPI, state: GetState, data: any) => {
      // you can do what ever you want, transforming data or manipulating data .... etc
      // get firebase data called `data.val()`
      return data.val();
    },
  },
  'GET_MY_REF_FAILURE', // -------> third, must be failure type
];
```

### Reducer

```js
export default function reducer(state: calcState = initialState, action: FSA) {
  const {type, payload} = action;

  switch (type) {
    case 'GET_MY_REF_REQUEST':
      // update request state

    case 'GET_MY_REF_SUCCESS':
      // update success state
      // you can get data from payload.

    case 'GET_MY_REF_FAILURE':
      // update failure state
  }
}
```

## Inspired

This is highly inspired by `redux-api-middleware`

https://github.com/agraboso/redux-api-middleware

## License

Apache-2.0 © [chilijung](https://github.com/chilijung)


[npm-image]: https://badge.fury.io/js/redux-firebase-middleware.svg
[npm-url]: https://npmjs.org/package/redux-firebase-middleware
[travis-image]: https://travis-ci.org/Canner/redux-firebase-middleware.svg?branch=master
[travis-url]: https://travis-ci.org/Canner/redux-firebase-middleware
[daviddm-image]: https://david-dm.org/Canner/redux-firebase-middleware.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/Canner/redux-firebase-middleware
