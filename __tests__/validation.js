import expect from 'expect';
import Symbol from 'es6-symbol';
import {
  isFirAction,
  isValidTypeDescriptor,
  validateFirAction,
  isValidateFirAction,
} from '../src/validation';

import CALL_FIR_API from '../src/CALL_FIR_API';

describe('validate FIR actions', () => {
  it('should fail passing none object value', () => {
    expect(isFirAction('')).toNotExist();
  });

  it('must have [CALL_FIR_API]', () => {
    expect(isFirAction({})).toNotExist();
  });

  it('must return true, if have [CALL_FIR_API]', () => {
    expect(isFirAction({[CALL_FIR_API]: {}})).toExist();
  })
});

describe('validate type descriptor', () => {
  it('should fail passing none object value', () => {
    expect(isValidTypeDescriptor('')).toNotExist();
  });

  it('should fail passing invalid key', () => {
    expect(isValidTypeDescriptor({type: 'test', inValidKey: ''})).toNotExist();
  });

  it('should fail passing without type key', () => {
    expect(isValidTypeDescriptor({})).toNotExist();
  });

  it('type property must be a string or symbol', () => {
    expect(isValidTypeDescriptor({type: {}})).toNotExist();
  });

  it('type may be a string', () => {
    expect(isValidTypeDescriptor({type: 'test'})).toExist();
  });

  it('type may be a symbol', () => {
    expect(isValidTypeDescriptor({type: Symbol()})).toExist();
  });
})
