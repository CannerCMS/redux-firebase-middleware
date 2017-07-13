/**
 * @flow
 */

import * as firebase from 'firebase';
import type {FirAPI} from './types';
import CALL_FIR_API from './CALL_FIR_API';
import {isFirAction} from './validation';
import {RequestError} from './errors';
import {actionWith, normalizeTypeDescriptors} from './utils';

export function firMiddleware(config: {[string]: string}) {
  const db = firebase.initializeApp(config).database();

  return ({getState}: any) => (next: Function) => async (action: FirAPI) => {
    if (!isFirAction(action)) {
      return next(action);
    }

    const callFIR = action[CALL_FIR_API];
    const {types, ref, method} = callFIR;
    const [requestType, successType, failureType] = normalizeTypeDescriptors(types);

    next(await actionWith(
      requestType,
      [action, getState()]
    ));
    let res;

    try {
      switch (method) {
        case 'once_value':
          res = await db.ref(ref).once('value');
          break;
        case 'once_child_added':
          res = await db.ref(ref).once('child_added');
          break;
        case 'once_child_changed':
          res = await db.ref(ref).once('child_changed');
          break;
        case 'once_child_removed':
          res = await db.ref(ref).once('child_removed');
          break;
        case 'once_child_moved':
          res = await db.ref(ref).once('child_moved');
          break;
        default:
          res = await db.ref(ref).once('value');
          break;
      }

      return next(await actionWith(
        successType,
        [action, getState(), res]
      ));
    } catch (e) {
      // The request was malformed, or there was a network error
      return next(await actionWith(
        {
          ...failureType,
          payload: new RequestError(e.message),
          error: true,
        },
        [action, getState(), res]
      ));
    }
  };
}