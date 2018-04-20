/**
 * @flow
 */

import type { FirAPI } from "./types";
import CALL_FIR_API from "./CALL_FIR_API";
import { isFirAction, validateFirAction } from "./validation";
import { RequestError, InvalidFirAction } from "./errors";
import { actionWith, normalizeTypeDescriptors } from "./utils";

export default (firebase: any) => {
  return ({ getState }: any) => (next: Function) => (action: FirAPI) => {
    const db = firebase.database();
    if (!isFirAction(action)) {
      // if it is not a FirAction go to the next middleware
      return next(action);
    }

    return (async () => {
      // try to dispatch an error request for invalid actions.
      const validationErrors = validateFirAction(action);
      if (validationErrors.length > 0) {
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
            res = await ref(db).once("value");
            break;
          case "once_child_added":
            res = await ref(db).once("child_added");
            break;
          case "once_child_changed":
            res = await ref(db).once("child_changed");
            break;
          case "once_child_removed":
            res = await ref(db).once("child_removed");
            break;
          case "once_child_moved":
            res = await ref(db).once("child_moved");
            break;
          default:
            res = await ref(db).once("value");
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
    })();
  };
};
