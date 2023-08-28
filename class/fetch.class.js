const fetch = require("node-fetch");

class Fetch {
  constructor() {}

  // https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
  fetchTimeout(url, ms, { signal, ...options } = {}) {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
  }
}

module.exports = {
    self: Fetch,
    instance: new Fetch()
}
