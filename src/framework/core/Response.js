class Response {
  constructor(res) {
    this.res = res;
    this.statusCode = 200;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  send(data) {
    this.res.writeHead(this.statusCode, this.headers);
    if (typeof data === 'object') {
      this.res.end(JSON.stringify(data));
    } else {
      this.res.end(data);
    }
  }

  json(data) {
    this.headers['Content-Type'] = 'application/json';
    this.res.writeHead(this.statusCode, this.headers);
    this.res.end(JSON.stringify(data));
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }
}

module.exports = Response;