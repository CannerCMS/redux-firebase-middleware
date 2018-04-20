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
    expect(isFirAction('')).toBeFalsy();
  });

  it('must have [CALL_FIR_API]', () => {
    expect(isFirAction({})).toBeFalsy();
  });

  it('must return true, if have [CALL_FIR_API]', () => {
    expect(isFirAction({[CALL_FIR_API]: {}})).toBeDefined();
  })
});

describe('validate type descriptor', () => {
  it('should fail passing none object value', () => {
    expect(isValidTypeDescriptor('')).toBeFalsy();
  });

  it('should fail passing invalid key', () => {
    expect(isValidTypeDescriptor({type: 'test', inValidKey: ''})).toBeFalsy();
  });

  it('should fail passing without type key', () => {
    expect(isValidTypeDescriptor({})).toBeFalsy();
  });

  it('type property must be a string or symbol', () => {
    expect(isValidTypeDescriptor({type: {}})).toBeFalsy();
  });

  it('type may be a string', () => {
    expect(isValidTypeDescriptor({type: 'test'})).toBeDefined();
  });

  it('type may be a symbol', () => {
    expect(isValidTypeDescriptor({type: Symbol()})).toBeDefined();
  });
})
