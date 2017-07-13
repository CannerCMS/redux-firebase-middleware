/**
 * @flow
 */

import {InternalError} from './errors';
import type {GetState, FSA} from './types';

export function normalizeTypeDescriptors(reqTypes: any) {
  let [requestType, successType, failureType] = reqTypes;

  // $FlowFixMe symbol
  if (typeof requestType === 'string' || typeof requestType === 'symbol') {
    requestType = {type: requestType};
  }

  // $FlowFixMe symbol
  if (typeof successType === 'string' || typeof successType === 'symbol') {
    successType = {type: successType};
  }

  successType = {
    payload: (action: FSA, state: GetState, res: any) => res.val(),
    ...successType,
  };

  // $FlowFixMe symbol
  if (typeof failureType === 'string' || typeof failureType === 'symbol') {
    failureType = {type: failureType};
  }

  failureType = {
    payload: (action: FSA, state: GetState, res: any) => res.val(),
    ...failureType,
  };

  return [requestType, successType, failureType];
}


export async function actionWith(descriptor: FSA, args: Array<mixed>) {
  try {
    descriptor.payload = await (
      typeof descriptor.payload === 'function' ?
      descriptor.payload(...args) : descriptor.payload
    );
  } catch (e) {
    descriptor.payload = new InternalError(e.message);
    descriptor.error = true;
  }
  return descriptor;
}