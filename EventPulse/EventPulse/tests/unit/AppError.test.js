const AppError = require('../../utils/AppError');

describe('AppError', () => {
  it('sets the message and statusCode correctly (success/expected case)', () => {
    const err = new AppError('Event not found.', 404);
    expect(err.message).toBe('Event not found.');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  it('derives status "fail" for 4xx codes', () => {
    const err = new AppError('Bad input', 400);
    expect(err.status).toBe('fail');
  });

  it('derives status "error" for 5xx codes', () => {
    const err = new AppError('Server exploded', 500);
    expect(err.status).toBe('error');
  });

  it('defaults to statusCode 500 when none is given (failure case)', () => {
    const err = new AppError('Unknown issue');
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');
  });

  it('is an instance of Error', () => {
    const err = new AppError('Oops', 400);
    expect(err instanceof Error).toBe(true);
  });
});
