import type { Options } from 'swagger-jsdoc';


export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JBA MSS-API',
      version: '1.0.0',
      description: 'MaterialSearchSystem-API for Jubla Aarau'
    },
    servers: [
      { 
        url: 'http://192.168.32.70:3000', 
        description: 'Development Server (local)' 
      },
      { 
        url: 'http://100.65.134.101:3000', 
        description: 'Development Server (tailscale)' 
      },
      { 
        url: 'http://mss.jubla-aarau.ch:3000', 
        description: 'Production Server' 
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts'] 
};