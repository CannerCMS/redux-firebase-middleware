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
      let dataSnapshot;

      try {
        switch (method) {
          // trigger firebase methods, get, set ...etc operations.
          case "once_value":
            dataSnapshot = await ref(db).once("value");
            return next(await actionWith(successType, [action, getState(), dataSnapshot]));
          case "set":
            dataSnapshot = await ref(db).set(content);
            return next(await actionWith(successType, [action, getState(), dataSnapshot]));
          case "update":
            dataSnapshot = await ref(db).update(content);
            return next(await actionWith(successType, [action, getState(), dataSnapshot]));
          case "remove":
            dataSnapshot = await ref(db).remove();
            return next(await actionWith(successType, [action, getState(), dataSnapshot]));
          case "on_value":
            const cb = async (dataSnapshot) => {
              const newSuccessType = Object.assign({}, successType);
              next(
                await actionWith(newSuccessType, [action, getState(), dataSnapshot],
                () => ref(db).off('value', cb))
              )
            };

            ref(db).on("value", cb);
            return;
          case "on_child_added":
            dataSnapshot = await ref(db).on("child_added");
            break;
          case "on_child_changed":
            dataSnapshot = await ref(db).on("child_changed");
            break;
          case "on_child_removed":
            dataSnapshot = await ref(db).on("child_removed");
            break;
          case "on_child_moved":
            dataSnapshot = await ref(db).on("child_moved");
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
            [action, getState(), dataSnapshot]
          )
        );
      }  
    })();
  };
};
