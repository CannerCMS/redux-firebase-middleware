import firMiddleware from '../src/middleware';
import CALL_FIR_API from '../src/CALL_FIR_API';
import firConfig from './config';
import firebase from 'firebase';

jest.setTimeout(10000);
firebase.initializeApp(firConfig)

describe('firMiddleware must be a Redux middleware', () => {
  const doGetState = () => {};
  const nextHandler = firMiddleware(firebase)({ getState: doGetState });
  const doNext = () => {};
  const actionHandler = nextHandler(doNext);

  test('must take one argument', () => {
    expect(firMiddleware.length).toBe(1)
  })
  
  describe('next handler', () => {
    test('must return a function to handle next', () => {
      expect(typeof nextHandler).toBe('function')
    })

    test('must take one argument', () => {
      expect(nextHandler.length).toBe(1);
    })

  })

  describe('action handler', () => {
    test('must return a function to handle action', () => {
      expect(typeof actionHandler).toBe('function');
    })

    test('must take one argument', () => {
      expect(actionHandler.length).toBe(1);
    })
  })
})

describe('firMiddleware must pass actions without an [CALL_API] symbol to the next handler', () => {
  const doGetState = () => {};
  const anAction = {};
  const nextHandler = firMiddleware(firebase)({ getState: doGetState });
  test('should pass action to next handler', done => {
    const doNext = action => {
      expect(anAction).toBe(action)
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  })

  test("mustn't return a promise on actions", () => {
    const doNext = action => action;
    const actionHandler = nextHandler(doNext);
  
    const noProm = actionHandler(anAction);
    expect(typeof noProm.then).toBe("undefined");
  });
})

describe('firMiddleware must pass valid request `types`', () => {
  const doGetState = () => {};
  const nextHandler = firMiddleware(firebase)({ getState: doGetState });
  
  test('must return a promise on actions with a [CALL_FIR] property', () => {
    const doNext = action => action;
    const actionHandler = nextHandler(doNext);
  
    const yesProm = actionHandler({[CALL_FIR_API]: {}});
    expect(typeof yesProm.then).toBe('function');
  });

  test('Must dispatch an error request for an invalid FirAction with a string request type', done => {
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST']
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = action => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
  
  test('Must dispatch an error request for an invalid FirAction with a descriptor request type', done => {
    const anAction = {
      [CALL_FIR_API]: {
        types: [
          {
            type: 'REQUEST'
          }
        ]
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = action => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);

    actionHandler(anAction);
  });

  test('Must do nothing for an invalid request without a request type', done => {
    const anAction = {
      [CALL_FIR_API]: {}
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = () => {
      throw Error('next handler called');
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
    setTimeout(() => {
      done();
    }, 200);
  });

  test('method must defined', done => {
    const anAction = {
      [CALL_FIR_API]: {
        ref: (db) => db.ref()
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = () => {
      throw Error('next handler called');
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
    setTimeout(() => {
      done();
    }, 200);
  });
})

describe('firMiddleware must dispatch an error request when FirAction have wrong ref type', () => {
  test('ref must defined', done => {
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        method: "once_value"
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.payload.validationErrors[0]).toBe('[CALL_API].ref property must have an ref property');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });

  test('ref type is a string which is invalid', done => {
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: "/test",
        method: "once_value"
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.payload.validationErrors[0]).toBe('[CALL_API].ref property must be a function');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });

  test('ref type return type is not firebase.database.Reference', done => {
    // https://firebase.google.com/docs/reference/js/firebase.database.Reference
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: () => 'test',
        method: "once_value"
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.payload.validationErrors[0]).toBe('[CALL_API].ref property must be an instance of firebase.database.Reference');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware must dispatch an error request when FirAction have wrong `method` type', () => {
  test('method must defined', done => {
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref()
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.payload.validationErrors[0]).toBe('[CALL_API].method must have a method property');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });

  test('method type must be one of the method types', done => {
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref(),
        method: "test"
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.payload.validationErrors[0]).toMatch('Invalid [CALL_API].method: test, must be one of');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });

  test('method must be a string', done => {
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref(),
        method: false
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      expect(action.type).toBe('REQUEST');
      expect(action.payload.name).toBe('InvalidFirAction');
      expect(action.payload.validationErrors[0]).toBe('[CALL_API].method property must be a string');
      expect(action.error).toBe(true);
      done();
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})


describe('firMiddleware get value once', () => {
  test('get the `/test` value once', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'once_value'
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        expect(action.payload.val()).toEqual({hello: 'world'});
        done();
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware `set` value', () => {
  test('set the `/test` value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'set',
        content: {foo: "bar"}
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        firebase.database().ref('test').once('value')
          .then(dataSnapshot => {
            expect(dataSnapshot.val()).toEqual({foo: 'bar'});
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware `update` value', () => {
  test('update the `/test` value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'update',
        content: {foo: "bar"}
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        firebase.database().ref('test').once('value')
          .then(dataSnapshot => {
            expect(dataSnapshot.val()).toEqual({
              foo: 'bar',
              hello: 'world'
            });
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware `remove` value', () => {
  test('remove the `/test` value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'remove'
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        firebase.database().ref('test').once('value')
          .then(dataSnapshot => {
            expect(dataSnapshot.val()).toEqual(null);
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware `on_value` listen new values', () => {
  test('listen ref `/test` for update value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({hello: 'world'})
    let updateValueTest = false
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_value'
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS' && !updateValueTest) {
        updateValueTest = true
        firebase.database().ref('test').update({foo: 'bar'})
      } else if (action.type === 'SUCCESS' && updateValueTest) {
        expect(action.payload.val()).toEqual({ foo: 'bar', hello: 'world' });
        action.off();
        done();
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });

  test('`/test` listen value and unsubscribe', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_value'
      }
    };
    const doGetState = () => {};
    const testCall = jest.fn();
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        testCall();
        action.off();
        firebase.database().ref('test').update({foo: 'bar'})
          .then(() => {
            expect(testCall).toHaveBeenCalledTimes(1);
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware `on_child_added` listen new values', () => {
  test('listen ref `/test` for update value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({hello: 'world'})
    let updateValueTest = false
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_added'
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS' && !updateValueTest) {
        updateValueTest = true
        firebase.database().ref('test').update({hello2: 'bar'})
      } else if (action.type === 'SUCCESS' && updateValueTest) {
        expect(action.payload.childSnapshot.val()).toEqual("bar");
        expect(action.payload.prevChildKey).toEqual("hello");
        action.off();
        done();
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });

  test('`/test` listen value and unsubscribe', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_added'
      }
    };
    const doGetState = () => {};
    const testCall = jest.fn();
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        testCall();
        action.off();
        firebase.database().ref('test').update({foo: 'bar'})
          .then(() => firebase.database().ref('test').once('value'))
          .then((snapShot) => {
            expect(snapShot.val()).toEqual({foo: 'bar', hello: 'world'})
            expect(testCall).toHaveBeenCalledTimes(1);
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware `on_child_added` listen new values', () => {
  test('listen ref `/test` for update value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({hello: 'world'})
    let updateValueTest = false
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_added'
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS' && !updateValueTest) {
        updateValueTest = true
        firebase.database().ref('test').update({hello2: 'bar'})
      } else if (action.type === 'SUCCESS' && updateValueTest) {
        expect(action.payload.childSnapshot.val()).toEqual("bar");
        expect(action.payload.prevChildKey).toEqual("hello");
        action.off();
        done();
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });

  test('`/test` listen value and unsubscribe', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_added'
      }
    };
    const doGetState = () => {};
    const testCall = jest.fn();
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        testCall();
        action.off();
        firebase.database().ref('test').update({foo: 'bar'})
          .then(() => firebase.database().ref('test').once('value'))
          .then((snapShot) => {
            expect(snapShot.val()).toEqual({foo: 'bar', hello: 'world'})
            expect(testCall).toHaveBeenCalledTimes(1);
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction);
  });
})

describe('firMiddleware `on_child_changed` listen new values', () => {
  test('listen ref `/test` for update value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_changed'
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        expect(action.payload.childSnapshot.val()).toEqual({foo: "bar"});
        expect(action.payload.prevChildKey).toEqual(null);
        action.off();
        done();
      }
    };
    const actionHandler = nextHandler(doNext);

    actionHandler(anAction)
      .then(() => {
        firebase.database().ref('test/hello').update({foo: 'bar'})
      });
  });

  test('`/test` listen value and unsubscribe', done => {
    firebase.database().ref('test').set({hello: 'world'})
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_changed'
      }
    };
    const doGetState = () => {};
    const testCall = jest.fn();
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        testCall();
        action.off();
        firebase.database().ref('test/hello').update({foo: 'bar2'})
          .then(() => {
            expect(testCall).toHaveBeenCalledTimes(1);
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction)
      .then(() => {
        firebase.database().ref('test/hello').update({foo: 'bar'})
      });
  });
})

describe('firMiddleware `on_child_removed` listen new values', () => {
  test('listen ref `/test` for removed value with {foo: "bar"}', done => {
    firebase.database().ref('test').set({
      hello: 'world',
      foo: 'bar'
    })
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_removed'
      }
    };
    const doGetState = () => {};
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        expect(action.payload.val()).toEqual("bar");
        action.off();
        done();
      }
    };
    const actionHandler = nextHandler(doNext);

    actionHandler(anAction)
      .then(() => {
        firebase.database().ref('test/foo').remove()
      });
  });

  test('`/test` listen child_removed and unsubscribe', done => {
    firebase.database().ref('test').set({
      hello: 'world',
      foo: "bar"
    })
    const anAction = {
      [CALL_FIR_API]: {
        types: ['REQUEST', 'SUCCESS', 'FAILURE'],
        ref: (db) => db.ref('/test'),
        method: 'on_child_removed'
      }
    };
    const doGetState = () => {};
    const testCall = jest.fn();
    const nextHandler = firMiddleware(firebase)({ getState: doGetState });
    const doNext = (action) => {
      if (action.type === 'SUCCESS') {
        testCall();
        action.off();
        firebase.database().ref('test/foo').remove()
          .then(() => {
            expect(testCall).toHaveBeenCalledTimes(1);
            done();
          })
      }
    };
    const actionHandler = nextHandler(doNext);
  
    actionHandler(anAction)
      .then(() => {
        firebase.database().ref('test/hello').remove()
      });
  });
})

describe('firMiddleware `on_child_moved` listen new values', () => {
  // test('listen ref `/test` for moved child sort by height', done => {
  //   firebase.database().ref('test').set({
  //     2: {height: 100},
  //     1: {height: 200}
  //   })
  //   const anAction = {
  //     [CALL_FIR_API]: {
  //       types: ['REQUEST', 'SUCCESS', 'FAILURE'],
  //       ref: (db) => db.ref('/test/1').orderByKey(),
  //       method: 'on_child_moved'
  //     }
  //   };
  //   const doGetState = () => {};
  //   const nextHandler = firMiddleware(firebase)({ getState: doGetState });
  //   const doNext = (action) => {
  //     if (action.type === 'SUCCESS') {
  //       expect(action.payload.val()).toEqual("bar");
  //       action.off();
  //       done();
  //     }
  //   };
  //   const actionHandler = nextHandler(doNext);

  //   actionHandler(anAction);
  // });

  // test('`/test` listen child_moved and unsubscribe', done => {
  //   firebase.database().ref('test').set({
  //     hello: 'world',
  //     foo: "bar"
  //   })
  //   const anAction = {
  //     [CALL_FIR_API]: {
  //       types: ['REQUEST', 'SUCCESS', 'FAILURE'],
  //       ref: (db) => db.ref('/test'),
  //       method: 'on_child_moved'
  //     }
  //   };
  //   const doGetState = () => {};
  //   const testCall = jest.fn();
  //   const nextHandler = firMiddleware(firebase)({ getState: doGetState });
  //   const doNext = (action) => {
  //     if (action.type === 'SUCCESS') {
  //       testCall();
  //       action.off();
  //       firebase.database().ref('test/foo').remove()
  //         .then(() => {
  //           expect(testCall).toHaveBeenCalledTimes(1);
  //           done();
  //         })
  //     }
  //   };
  //   const actionHandler = nextHandler(doNext);
  
  //   actionHandler(anAction)
  //     .then(() => {
  //       firebase.database().ref('test/hello').remove()
  //     });
  // });
})