# redux-firebase-middleware [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Redux middleware for firebase, support native web API or react-native-firebase API.

**NOTE: Only support for Firebase realtime database at this moment, welcome PRs for supporting Firestore**

## Why?

Firebase SDK is hard to achieve strict unidirectional data flow in Redux. If you have a hard time manage your Redux states from Firebase realtime database to your Redux store. This middleware help you seamlessly integrate Firebase with Redux workflow.

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

### Basic operations (Read, and write data)

dispatching a firMiddleware action.

- types **(Array<request, success, failure>)** : action constants types
- ref **((firebase.database) => firebase.database.Reference)**: Instance of firebase reference
- method: could be one of
  * `once_value`: https://firebase.google.com/docs/reference/js/firebase.database.Reference#once
  * `set`: https://firebase.google.com/docs/reference/js/firebase.database.Reference#set
  * `update`: https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
  * `remove`: https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove

```js
const {CALL_FIR_API} = require('redux-firebase-middleware');

export const GET_MY_REF = [
  'GET_MY_REF_REQUEST', // -------> first, must be request type
  'GET_MY_REF_SUCCESS', // -------> second, must be success type
  'GET_MY_REF_FAILURE', // -------> third, must be failure type
];

function callAnAction() {
  return dispatch({[CALL_FIR_API]: {
    types: GET_MY_REF, // -----> normally this should put in constants, see `constants`(next seciton) for more info
    ref: (db) => db.ref('test/path1'), // ----> your firebase reference path
    method: 'once_value',
  }});
}
```

***Reducers***

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

### Listener events (Reading and writing lists)

dispatching a firMiddleware listener actions.

- types **(Array<request, success, failure>)** : action constants types
- ref **((firebase.database) => firebase.database.Reference | firebase.database.Query)**: Instance of firebase reference or firebase query
- method: could be one of, please reference to: https://firebase.google.com/docs/reference/js/firebase.database.Reference#on
  * `on_value`
  * `on_child_added`
  * `on_child_changed`
  * `on_child_removed`
  * `on_child_moved`

```js
const {CALL_FIR_API} = require('redux-firebase-middleware');

export const GET_MY_REF = [
  'GET_MY_REF_REQUEST', // -------> first, must be request type
  'GET_MY_REF_SUCCESS', // -------> second, must be success type
  'GET_MY_REF_FAILURE', // -------> third, must be failure type
];

function callAnAction() {
  return dispatch({[CALL_FIR_API]: {
    types: GET_MY_REF, // -----> normally this should put in constants, see `constants`(next seciton) for more info
    ref: (db) => db.ref('test/path1'), // ----> your firebase reference path
    method: 'on_value',
  }});
}
```

To remove the listener, you'll get `off` method in actions' reducer.

***Reducers***

When the state is successful it'll received data as payload, payload's value is slightly different in different methods.

Payload in methods:
  * `on_value`: dataSnapshot
  * `on_child_added`: `{childSnapshot, prevChildKey}`
  * `on_child_changed`: `{childSnapshot, prevChildKey}`
  * `on_child_removed`: oldChildSnapshot
  * `on_child_moved`: `{childSnapshot, prevChildKey}`

```js
export default function reducer(state: calcState = initialState, action: FSA) {
  // or if you're using event listeners you'll get additional `off` method to remove the listening event by calling `off()` 
  const {type, payload, off} = action

  switch (type) {
    case 'GET_MY_REF_REQUEST':
      // update request state

    case 'GET_MY_REF_SUCCESS':
      // update success state
      // you can get data from payload.

    case 'GET_MY_REF_FAILURE':
      // update failure state

    case 'REMOVE_LISTENER':
      // call off method to unlisten the event
      off();
  }
}
```

#### Customized payload

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

## Credits

Inspired by `redux-api-middleware`

https://github.com/agraboso/redux-api-middleware

## License

MIT © [chilijung](https://github.com/chilijung)


[npm-image]: https://badge.fury.io/js/redux-firebase-middleware.svg
[npm-url]: https://npmjs.org/package/redux-firebase-middleware
[travis-image]: https://travis-ci.org/Canner/redux-firebase-middleware.svg?branch=master
[travis-url]: https://travis-ci.org/Canner/redux-firebase-middleware
[daviddm-image]: https://david-dm.org/Canner/redux-firebase-middleware.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/Canner/redux-firebase-middleware
