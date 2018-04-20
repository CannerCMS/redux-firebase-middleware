/**
 * Error class for an FirAction that does not conform to the FirAction definition
 *
 * @class InvalidFirAction
 * @access public
 * @param {array} validationErrors - an array of validation errors
 */
export class InvalidFirAction extends Error {
  constructor(validationErrors) {
    super();
    this.name = "InvalidFirAction";
    this.message = "Invalid FirAction";
    this.validationErrors = validationErrors;
  }
}

/**
 * Error class for a custom `payload` or `meta` function throwing
 *
 * @class InternalError
 * @access public
 * @param {string} message - the error message
 */
export class InternalError extends Error {
  constructor(message) {
    super();
    this.name = "InternalError";
    this.message = message;
  }
}

/**
 * Error class for an error raised trying to make an API call
 *
 * @class RequestError
 * @access public
 * @param {string} message - the error message
 */
export class RequestError extends Error {
  constructor(message) {
    super();
    this.name = "RequestError";
    this.message = message;
  }
}
