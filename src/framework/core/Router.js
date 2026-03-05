const url = require('url');

class Router {
  constructor() {
    this.routes = {
      GET: new Map(),
      POST: new Map(),
      PUT: new Map(),
      PATCH: new Map(),
      DELETE: new Map()
    };
    this.middlewares = [];
    console.log('✅ Router initialized');
  }

  use(middleware) {
    this.middlewares.push(middleware);
    console.log(`✅ Middleware added, total: ${this.middlewares.length}`);
  }

  _addRoute(method, path, handler) {
    console.log(`📝 Adding route: ${method} ${path}`);
    
    // Преобразуем путь с параметрами в регулярное выражение
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    
    const regex = new RegExp(`^${regexPath}$`);
    
    this.routes[method].set(path, {
      handler,
      regex,
      paramNames,
      originalPath: path
    });
    
    console.log(`✅ Route added: ${method} ${path}`);
  }

  get(path, handler) {
    this._addRoute('GET', path, handler);
  }

  post(path, handler) {
    this._addRoute('POST', path, handler);
  }

  put(path, handler) {
    this._addRoute('PUT', path, handler);
  }

  patch(path, handler) {
    this._addRoute('PATCH', path, handler);
  }

  delete(path, handler) {
    this._addRoute('DELETE', path, handler);
  }

  findRoute(method, url) {
    console.log(`🔍 Finding route for ${method} ${url}`);
    
    const routesForMethod = this.routes[method];
    if (!routesForMethod) {
      console.log(`❌ No routes for method ${method}`);
      return null;
    }

    // Сначала ищем точное совпадение
    for (const [path, routeInfo] of routesForMethod) {
      if (path === url) {
        console.log(`✅ Exact match found: ${path}`);
        return { handler: routeInfo.handler, params: {} };
      }
    }

    // Затем ищем по регулярным выражениям (для параметризованных маршрутов)
    for (const [path, routeInfo] of routesForMethod) {
      const match = url.match(routeInfo.regex);
      if (match) {
        console.log(`✅ Regex match found: ${path}`);
        
        // Извлекаем параметры
        const params = {};
        routeInfo.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        
        console.log(`📌 Extracted params:`, params);
        
        return {
          handler: routeInfo.handler,
          params
        };
      }
    }

    console.log(`❌ No route found for ${method} ${url}`);
    return null;
  }

  async handle(req, res) {
    console.log(`\n🔄 Handling request: ${req.method} ${req.url}`);
    
    try {
      // Находим маршрут
      const route = this.findRoute(req.method, req.url);
      
      if (!route) {
        console.log(`❌ Route not found: ${req.method} ${req.url}`);
        res.status(404).json({ 
          error: 'Route not found',
          message: `Cannot ${req.method} ${req.url}`
        });
        return;
      }

      // Добавляем параметры в запрос
      req.params = route.params || {};
      console.log(`📦 Request params:`, req.params);

      // Выполняем middleware
      console.log(`🔄 Executing ${this.middlewares.length} middlewares...`);
      for (const middleware of this.middlewares) {
        await new Promise((resolve, reject) => {
          middleware(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      console.log(`✅ Middlewares executed`);

      // Выполняем обработчик маршрута
      console.log(`🎯 Executing route handler...`);
      await route.handler(req, res);
      console.log(`✅ Route handler executed`);
      
    } catch (error) {
      console.error(`❌ Error in router.handle:`, error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal Server Error',
          message: error.message 
        });
      }
    }
  }
}

module.exports = Router;