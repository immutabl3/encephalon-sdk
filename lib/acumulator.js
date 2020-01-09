/* eslint-disable no-underscore-dangle */
import createRequest from './request';

export default async function acumulator(resolve, reject) {
  this.then = this.__then;

  try {
    const config = this._config;
    const throttle = this._throttle;
    const url = this._url;

    const perPage = this.qs.per_page || 25;
    const res = await throttle(() => this);
    const total = +res.headers.total || 0;
    const all = res.data;
    const lastPage = Math.ceil(total / perPage);

    let page = this.qs.page || 1;
    while (page < lastPage) {
      page++;
      const res = createRequest('get', url, config)
        .page(page)
        .perPage(perPage);

      !!this.qs._ && res.cachebust();
      const { data } = await throttle(() => res);
      all.push(...data);
    }

    return Promise.resolve({
      headers: res.headers,
      status: res.status,
      data: all,
    }).then(resolve, reject);
  } catch (err) {
    return Promise.reject(err).then(resolve, reject);
  }
};