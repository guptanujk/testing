require('dotenv').config();
import * as bodyParser from 'body-parser';
import express from 'express';
import path from 'path'
import { logger } from './helper/log4js/logger';
import { rbac } from './config/rbac';
import fs from 'fs'
import cors from 'cors';
import * as errorHandler from './utilities/apiErrorHandler';
const session = require('express-session');
const cookieParser = require('cookie-parser')
const jsyaml = require('js-yaml');
const swaggerTools = require('swagger-tools');
// const gateway = require('express-gateway');
const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const PORT = process.env.NODE_PORT
const connection = require('./config/mySqlDB');
const indexRoute = require('./routes/index.route').default;
require('./init_db/init_data');
const allowedOriginsStr = process.env.ALLOWED_ORIGINS || ''
const allowedOrigins = allowedOriginsStr.split(",").map(item => item.trim());
app.use(cookieParser())
const corsOptions: cors.CorsOptions = {
    credentials:true,
    origin: allowedOrigins
};
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.ENCRYPTION_KEY,
    cookie: {
      secure: process.env.SECURE_COOKIE === "true", // Use HTTPS for production
      httpOnly: true, // Prevent client-side JavaScript access
      sameSite: 'strict', // Mitigate CSRF attacks
      domain: process.env.COOKIE_DOMAIN
    }
}));

  rbac.init();

  app.use(cors(corsOptions));

  app.use(function (req: any, res: any, next: any) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    // res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    res.setHeader("Content-Security-Policy", "defaultSrc 'self'; styleSrc: 'self' 'unsafe-inline'; imgSrc: 'self' validator.swagger.io scriptSrc: 'self' 'unsafe-inline'");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.removeHeader("X-Powered-By");
    next();
  });

  app.use("/", indexRoute);

  app.use((req:any, res:any, next) => {
    next();
  });

  app.get("/healthCheck", (req, res) => {
    res.status(200).send({status: true})
  });

  // gateway()
  //   .load(path.join("src/", 'config'))
  //   .run()
  //   .then(() => {
  //     logger.info('Gateway Loading.....');
  //   });

  app.use(errorHandler.notFoundErrorHandler);

  app.use(errorHandler.errorHandler);

  const server = app.listen(PORT, () => {
    logger.info('Server Listed on Port', PORT);
  //   InitData().catch(err => logger.error("Err at loading IntiData: ", err))
  });




const spec = fs.readFileSync(path.join("src/", 'api/swagger.yaml'), 'utf8');
const swaggerDoc = jsyaml.load(spec);
const options = {
  swaggerUi: path.join("src/", '/api/swagger.yaml'),
  useStubs: process.env.NODE_ENV === 'development', // Conditionally turn on stubs (mock mode)
};

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware: any) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());
});


