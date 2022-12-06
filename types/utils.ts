import { RequestHandler, Request, Response, NextFunction } from "express";

type PromiseRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type MakeMiddleware<T> = (arg: T) => RequestHandler;
export type MakePromiseMiddleware<T> = (arg: T) => PromiseRequestHandler;
