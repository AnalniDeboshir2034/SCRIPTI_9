const url = require('url');

class Request {
  constructor(req) {
    this.req = req;
    this.url = req.url;
    this.method = req.method;
    this.headers = req.headers;
    this.params = {};
    this.query = this._parseQuery();
    this.body = null;
  }

  _parseQuery() {
    const parsedUrl = url.parse(this.url, true);
    return parsedUrl.query;
  }

  async parseBody() {
    return new Promise((resolve, reject) => {
      let body = [];
      this.req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        if (body) {
          try {
            this.body = JSON.parse(body);
          } catch (e) {
            this.body = this._parseFormData(body);
          }
        }
        resolve();
      }).on('error', reject);
    });
  }

  _parseFormData(body) {
    const params = new URLSearchParams(body);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }
}

module.exports = Request;