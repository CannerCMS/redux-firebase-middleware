/**
 * @flow
 */

import CALL_FIR_API from './CALL_FIR_API';
import {isPlainObject} from 'lodash';
import type {FirAPI, TypeDescriptor} from './types';

export function isFirAction(action: FirAPI) {
  return isPlainObject(action) && action.hasOwnProperty(CALL_FIR_API);
}

export function isValidTypeDescriptor(obj: TypeDescriptor) {
  const validKeys = [
    'type',
    'payload'
  ]

  if (!isPlainObject(obj)) {
    return false;
  }
  for (let key in obj) {
    if (!~validKeys.indexOf(key)) {
      return false;
    }
  }
  if (!('type' in obj)) {
    return false;

  // $FlowFixMe symbol
  } else if (typeof obj.type !== 'string' && typeof obj.type !== 'symbol') {
    return false;
  }

  return true;
}

export function validateFirAction(action: FirAPI) {
  var validationErrors = [];
  const validCallAPIKeys = [
    'ref',
    'method',
    'types'
  ];

  const validMethods = [
    'once_value',
    'once_child_added',
    'once_child_changed',
    'once_child_removed',
    'once_child_moved'
  ];

  if (!isFirAction(action)) {
    validationErrors.push('FirAction must be plain JavaScript objects with a [CALL_FIR_API] property');
    return validationErrors;
  }

  for (let key in action) {
    if (key !== [CALL_FIR_API]) {
      validationErrors.push(`Invalid root key: ${key}`);
    }
  }

  const callAPI = action[CALL_FIR_API];
  if (!isPlainObject(callAPI)) {
    validationErrors.push('[CALL_FIR_API] property must be a plain JavaScript object');
  }
  for (let key in callAPI) {
    if (!~validCallAPIKeys.indexOf(key)) {
      validationErrors.push(`Invalid [CALL_FIR_API] key: ${key}`);
    }
  }

  const { ref, method, types } = callAPI;
  if (typeof ref === 'undefined') {
    validationErrors.push('[CALL_API] must have an ref property');
  } else if (typeof ref !== 'string' && typeof ref !== 'function') {
    validationErrors.push('[CALL_API].ref property must be a string or a function');
  }
  if (typeof method === 'undefined') {
    validationErrors.push('[CALL_API] must have a method property');
  } else if (typeof method !== 'string') {
    validationErrors.push('[CALL_API].method property must be a string');
  } else if (!~validMethods.indexOf(method.toUpperCase())) {
    validationErrors.push(`Invalid [CALL_API].method: ${method.toUpperCase()}`);
  }

  if (typeof types === 'undefined') {
    validationErrors.push('[CALL_API] must have a types property');
  } else if (!Array.isArray(types) || types.length !== 3) {
    validationErrors.push('[CALL_API].types property must be an array of length 3');
  } else {
    const [requestType, successType, failureType] = types;

    // $FlowFixMe symbol
    if (typeof requestType !== 'string' && typeof requestType !== 'symbol' && !isValidTypeDescriptor(requestType)) {
      validationErrors.push('Invalid request type');
    }
    // $FlowFixMe symbol
    if (typeof successType !== 'string' && typeof successType !== 'symbol' && !isValidTypeDescriptor(successType)) {
      validationErrors.push('Invalid success type');
    }
    // $FlowFixMe symbol
    if (typeof failureType !== 'string' && typeof failureType !== 'symbol' && !isValidTypeDescriptor(failureType)) {
      validationErrors.push('Invalid failure type');
    }
  }

  return validationErrors;
}

export function isValidateFirAction(action: FirAPI) {
  return !validateFirAction(action).length;
}
