# redux-firebase-middleware [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> redux middleware for firebase

## Installation

```sh
$ npm install --save redux-firebase-middleware
```

## Usage

#### Store

Setting up in your redux store

```js
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

const fir = firMiddleware(config);

const finalCreateStore = compose(
  applyMiddleware(thunk),
  applyMiddleware(fir) // -----> apply fir middleware in redux store
)(createStore);

.....

```

#### dispatch action

dispatching a firMiddleware action.

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

#### Constants


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

#### Reducer

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
