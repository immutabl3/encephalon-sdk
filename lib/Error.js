export default class EncephalonError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, EncephalonError);

    this.code = 404;
    this.name = 'EncephalonError';
    this.message = `encephalon: ${message}`;
  }
};