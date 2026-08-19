const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler', () => {
  it('calls the wrapped function and does not call next on success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const next = jest.fn();
    const wrapped = asyncHandler(fn);

    await wrapped({}, {}, next);

    expect(fn).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a rejected promise to next() (failure case)', async () => {
    const error = new Error('boom');
    const fn = jest.fn().mockRejectedValue(error);
    const next = jest.fn();
    const wrapped = asyncHandler(fn);

    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('passes req, res, next through to the wrapped function', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const req = { a: 1 };
    const res = { b: 2 };
    const next = jest.fn();
    const wrapped = asyncHandler(fn);

    await wrapped(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
  });
});
