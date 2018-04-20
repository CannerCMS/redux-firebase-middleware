/**
 * @flow
 */

import type { FirAPI } from "./types";
import CALL_FIR_API from "./CALL_FIR_API";
import { isFirAction, validateFirAction } from "./validation";
import { RequestError, InvalidFirAction } from "./errors";
import { actionWith, normalizeTypeDescriptors } from "./utils";

export function firMiddleware(firebase: any) {
  return ({ getState }: any) => (next: Function) => async (action: FirAPI) => {
    const db = firebase.database();
    if (!isFirAction(action)) {
      // if it is not a FirAction go to the next middleware
      return next(action);
    }

    // try to dispatch an error request for invalid actions.
    const validationErrors = validateFirAction(action);
    if (validationErrors.length) {
      const callAPI = action[CALL_FIR_API];
      if (callAPI.types && Array.isArray(callAPI.types)) {
        let requestType = callAPI.types[0];
        if (requestType && requestType.type) {
          requestType = requestType.type;
        }
        next({
          type: requestType,
          payload: new InvalidFirAction(validationErrors),
          error: true
        });
      }
      return;
    }

    const callFIR = action[CALL_FIR_API];
    const { types, ref, method } = callFIR;
    const [requestType, successType, failureType] = normalizeTypeDescriptors(
      types
    );

    next(await actionWith(requestType, [action, getState()]));
    let res;

    try {
      switch (method) {
        // trigger firebase methods, get, set ...etc operations.
        case "once_value":
          res = await db.ref(ref).once("value");
          break;
        case "once_child_added":
          res = await db.ref(ref).once("child_added");
          break;
        case "once_child_changed":
          res = await db.ref(ref).once("child_changed");
          break;
        case "once_child_removed":
          res = await db.ref(ref).once("child_removed");
          break;
        case "once_child_moved":
          res = await db.ref(ref).once("child_moved");
          break;
        default:
          res = await db.ref(ref).once("value");
          break;
      }

      return next(await actionWith(successType, [action, getState(), res]));
    } catch (e) {
      // The request was malformed, or there was a network error
      return next(
        await actionWith(
          {
            ...failureType,
            payload: new RequestError(e.message),
            error: true
          },
          [action, getState(), res]
        )
      );
    }
  };
}
