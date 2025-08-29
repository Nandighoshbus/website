// Global type declarations to fix Render deployment issues
declare module 'express' {
  export interface Request {
    [key: string]: any;
  }
  
  export interface Response {
    [key: string]: any;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export interface Application {
    [key: string]: any;
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    listen: any;
  }
  
  export interface Router {
    [key: string]: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    use: any;
  }
  
  function express(): Application;
  function Router(): Router;
  
  namespace express {
    export { Request, Response, NextFunction, Application, Router };
    export function json(options?: any): any;
    export function urlencoded(options?: any): any;
    export function static(path: string): any;
  }
  
  export = express;
  export { Router };
}

declare module 'cors' {
  function cors(options?: any): any;
  export = cors;
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
  }
  
  export interface SignOptions {
    [key: string]: any;
  }
  
  export function sign(payload: any, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string, options?: any): any;
  export function decode(token: string, options?: any): any;
}

declare module 'bcrypt' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
}

declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
}

declare module 'compression' {
  function compression(options?: any): any;
  namespace compression {
    export function filter(req: any, res: any): boolean;
  }
  export = compression;
}

declare module 'morgan' {
  function morgan(format: string, options?: any): any;
  export = morgan;
}

declare module 'nodemailer' {
  export function createTransporter(options: any): any;
  export const createTransport: any;
}

declare module 'helmet' {
  function helmet(options?: any): any;
  export = helmet;
}

declare module 'joi' {
  export const object: any;
  export const string: any;
  export const number: any;
  export const boolean: any;
  export const array: any;
  export const date: any;
  export const ref: any;
}

declare module 'uuid' {
  export function v4(): string;
}

declare module 'winston' {
  export interface Logger {
    [key: string]: any;
  }
  
  export interface transport {
    [key: string]: any;
  }
  
  export const createLogger: any;
  export const format: any;
  export const transports: any;
}

declare module 'razorpay' {
  class Razorpay {
    constructor(options: any);
    [key: string]: any;
  }
  export = Razorpay;
}
