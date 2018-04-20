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
      const { types, ref, method, content = {}} = callFIR;
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
            return next(await actionWith(successType, [action, getState(), res]));
          case "set":
            res = await ref(db).set(content);
            return next(await actionWith(successType, [action, getState(), res]));
          case "update":
            res = await ref(db).update(content);
            return next(await actionWith(successType, [action, getState(), res]));
          case "remove":
            res = await ref(db).remove();
            return next(await actionWith(successType, [action, getState(), res]));
          case "on_value":
            res = await ref(db).on("value");
            break;
          case "on_child_added":
            res = await ref(db).on("child_added");
            break;
          case "on_child_changed":
            res = await ref(db).on("child_changed");
            break;
          case "on_child_removed":
            res = await ref(db).on("child_removed");
            break;
          case "on_child_moved":
            res = await ref(db).on("child_moved");
            break;
          default:
            throw new Error('Invalid method: ', method);
        }
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
