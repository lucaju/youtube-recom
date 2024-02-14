import { NextFunction, Request, Response } from 'express';

/**
 * Custom middleware sets Access-Control-Allow headers in the response.
 *
 * @function
 * @param {Object} request The request
 * @param {Object} response The response
 * @param {Function} next Next middleware function
 */
export const httpHeaders = (request: Request, response: Response, next: NextFunction) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
