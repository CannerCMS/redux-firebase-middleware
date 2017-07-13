/**
 * @flow
 */

export type FSA = {
  type: string,
  payload?: ?any,
  error?: ?boolean
};

export type FirAPI = {
  [symbolApi: any]: {
    types: [string, string, string],
    ref: string,
    method?: string,
  }
};

export type GetState = () => Object;
