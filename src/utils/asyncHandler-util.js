const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler = () => {};
// const asyncHandler = (func) => {
//   () => {};
// };
//  const asyncHandler = (func) => () =>{}
// const asyncHandler = (func) => async () => {};

// When using TRY-CATCH method
/* const asyncHandler = (func) => async () => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      sucess: false,
      message: err.message,
    });
  }
};
*/
