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
      const { types, ref, method, content = {} } = callFIR;
      const [requestType, successType, failureType] = normalizeTypeDescriptors(
        types
      );

      next(await actionWith(requestType, [action, getState()]));

      // listener method
      function listenerMethods(type) {
        const cb = async (dataSnapshot, prevChildKey) => {
          const newSuccessType = Object.assign({}, successType);
          if (
            type === "child_added" ||
            type === "child_changed" ||
            type === "child_moved"
          ) {
            dataSnapshot = {
              childSnapshot: dataSnapshot,
              prevChildKey
            };
          }

          next(
            await actionWith(
              newSuccessType,
              [action, getState(), dataSnapshot],
              () => ref(db).off(type, cb)
            )
          );
        };

        ref(db).on(type, cb);
      }

      let dataSnapshot;
      try {
        switch (method) {
          // trigger firebase methods, get, set ...etc operations.
          case "once_value":
            dataSnapshot = await ref(db).once("value");
            return next(
              await actionWith(successType, [action, getState(), dataSnapshot])
            );
          case "set":
            dataSnapshot = await ref(db).set(content);
            return next(
              await actionWith(successType, [action, getState(), dataSnapshot])
            );
          case "update":
            dataSnapshot = await ref(db).update(content);
            return next(
              await actionWith(successType, [action, getState(), dataSnapshot])
            );
          case "remove":
            dataSnapshot = await ref(db).remove();
            return next(
              await actionWith(successType, [action, getState(), dataSnapshot])
            );
          case "on_value":
            listenerMethods("value");
            return;
          case "on_child_added":
            listenerMethods("child_added");
            return;
          case "on_child_changed":
            listenerMethods("child_changed");
            return;
          case "on_child_removed":
            listenerMethods("child_removed");
            return;
          case "on_child_moved":
            listenerMethods("child_moved");
            return;
          default:
            throw new Error("Invalid method: ", method);
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
