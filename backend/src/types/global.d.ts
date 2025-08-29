// Global type declarations to fix Render deployment issues
declare module 'express' {
  import express from 'express';
  export = express;
}

declare module 'cors' {
  import cors from 'cors';
  export = cors;
}

declare module 'jsonwebtoken' {
  import jwt from 'jsonwebtoken';
  export = jwt;
}

declare module 'bcrypt' {
  import bcrypt from 'bcrypt';
  export = bcrypt;
}

declare module 'bcryptjs' {
  import bcryptjs from 'bcryptjs';
  export = bcryptjs;
}

declare module 'compression' {
  import compression from 'compression';
  export = compression;
}

declare module 'morgan' {
  import morgan from 'morgan';
  export = morgan;
}

declare module 'nodemailer' {
  import nodemailer from 'nodemailer';
  export = nodemailer;
}

declare module 'helmet' {
  import helmet from 'helmet';
  export = helmet;
}

declare module 'joi' {
  import joi from 'joi';
  export = joi;
}

declare module 'uuid' {
  import uuid from 'uuid';
  export = uuid;
}

declare module 'winston' {
  import winston from 'winston';
  export = winston;
}

declare module 'razorpay' {
  import razorpay from 'razorpay';
  export = razorpay;
}
