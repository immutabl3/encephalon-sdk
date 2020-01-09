export const delay = ms => new Promise(res => setTimeout(res, ms));

const codes = new Set([410, 401, 409, 304, 413, 403, 422]);
export const shouldTryAgain = (err, res) => {
  return err && res.req.method === 'GET' && !codes.has(res.status);
};

export const resolveUrl = (base, url) => {
  const lastChar = base[base.length - 1];
  const spacer = lastChar !== '/' ? '/' : '';
  return `${base}${spacer}${url[0] === '/' ? url.substr(1) : url}`;
};