import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request & { traceId?: string }, res: Response, next: NextFunction) {
    const incoming = req.headers['x-trace-id'];
    req.traceId = typeof incoming === 'string' && incoming.length > 0 ? incoming : uuidv4();
    res.setHeader('x-trace-id', req.traceId);
    next();
  }
}
