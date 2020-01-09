const stringifyQuery = query => Object
  .entries(query)
  .filter(([key]) => key !== '_')
  .map(([key, value]) => `${key}=${value}`)
  .sort()
  .join('&');

export const createKey = (url, query) => (
  `${url}|${stringifyQuery(query)}`
);

export const MemoryCache = ({ ttl }) => {
  const memory = new Map();

  return {
    get length() {
      return memory.size;
    },

    keys() {
      return Array.from(memory.keys());
    },

    get(key) {
      if (!memory.has(key)) return;

      const { exp, data } = memory.get(key);
      if (Date.now() > exp) {
        memory.delete(key);
        return;
      }

      return data;
    },

    set(key, payload) {
      memory.set(key, {
        exp: Date.now() + ttl,
        data: payload,
      });

      return key;
    },

    delete(key) {
      memory.has(key) && memory.delete(key);
      return this;
    },

    clear() {
      memory.clear();
      return this;
    },
  };
};

const noop = () => {};
const blankKeys = () => [];

export const NoCache = () => ({
  length: 0,
  keys: blankKeys,
  get: noop,
  set: noop,
  clear: noop,
  delete: noop,
});