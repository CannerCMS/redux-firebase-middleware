/**
 * @flow
 */

import CALL_FIR_API from './CALL_FIR_API';
import {isPlainObject} from 'lodash';
import type {FirAPI} from './types';

export function isFirAction(action: FirAPI) {
  return isPlainObject(action) && action.hasOwnProperty(CALL_FIR_API);
}
