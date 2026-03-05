const http = require('http');
const Router = require('./Router');
const Request = require('./Request');
const Response = require('./Response');

class Application {
  constructor() {
    this.router = new Router();
    console.log('✅ Application initialized');
  }

  use(middleware) {
    this.router.use(middleware);
  }

  // Route methods
  get(path, handler) {
    this.router.get(path, handler);
  }

  post(path, handler) {
    this.router.post(path, handler);
  }

  put(path, handler) {
    this.router.put(path, handler);
  }

  patch(path, handler) {
    this.router.patch(path, handler);
  }

  delete(path, handler) {
    this.router.delete(path, handler);
  }

  async _handleRequest(req, res) {
    console.log(`\n📨 Incoming request: ${req.method} ${req.url}`);
    
    const request = new Request(req);
    const response = new Response(res);

    try {
      // Parse body for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        console.log(`📦 Parsing body for ${req.method} request...`);
        await request.parseBody();
        console.log(`✅ Body parsed:`, request.body);
      }

      await this.router.handle(request, response);
    } catch (error) {
      console.error('❌ Error handling request:', error);
      if (!res.headersSent) {
        response.status(500).json({ 
          error: 'Internal Server Error',
          message: error.message 
        });
      }
    }
  }

  listen(port, callback) {
    this.server = http.createServer((req, res) => {
      this._handleRequest(req, res);
    });

    this.server.listen(port, () => {
      console.log(`\n✅ Server is listening on port ${port}`);
      if (callback) callback();
    });
    
    return this.server;
  }
}

module.exports = Application;