import { AppError } from '../utils/appError.js';

const validateMiddleware = ({ body, query, params }) => (req, res, next) => {
  try {
    if (body) {
      const bodyResult = body.safeParse(req.body);
      if (!bodyResult.success) {
        const firstIssue = bodyResult.error.issues[0];
        throw new AppError(firstIssue.message, 400);
      }
      req.validatedBody = bodyResult.data;
    }

    if (query) {
      const queryResult = query.safeParse(req.query);
      if (!queryResult.success) {
        const firstIssue = queryResult.error.issues[0];
        throw new AppError(firstIssue.message, 400);
      }
      req.validatedQuery = queryResult.data;
    }

    if (params) {
      const paramsResult = params.safeParse(req.params);
      if (!paramsResult.success) {
        const firstIssue = paramsResult.error.issues[0];
        throw new AppError(firstIssue.message, 400);
      }
      req.validatedParams = paramsResult.data;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validateMiddleware;
