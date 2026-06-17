import { NextFunction, RequestHandler, Request, Response } from 'express';

interface CustomError extends Error {
    status?: number;
    code?: string;
    keyValue?: Record<string, any>;
}

const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error: any) {
            let status = 500;
            let message = 'Internal server error';

            // MongoDB duplicate key error
            if (error.code === 11000) {
                status = 409; // Conflict
                const field = Object.keys(error.keyValue)[0];
                message = `${field} already exists`;
            }
            // MongoDB validation error
            else if (error.name === 'ValidationError') {
                status = 400; // Bad Request
                message = Object.values(error.errors)
                    .map((err: any) => err.message)
                    .join(', ');
            }
            // Cast error (invalid ObjectId)
            else if (error.name === 'CastError') {
                status = 400;
                message = 'Invalid ID format';
            }
            // Custom error with status
            else if (error.status) {
                status = error.status;
                message = error.message;
            }
            // Generic error
            else if (error.message) {
                message = error.message;
            }

            return res.status(status).json({ 
                message,
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            });
        }
    }
}
export default TryCatch;