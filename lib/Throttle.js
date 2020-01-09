import Error from './Error';
import { delay } from './helpers';

export default function Throttle(concurrency, interval) {
  if (!Number.isInteger(concurrency)) throw new Error(`throttle: invalid value for 'concurrency'`);
  if (!Number.isInteger(interval)) throw new Error(`throttle: invalid value for 'delay'`);
  
  const queue = [];

  let activeCount = 0;

  const next = async function() {
    if (activeCount >= concurrency) return;
    if (!queue.length) return;
    
    activeCount++;

    const {
      resolve,
      reject,
      fn,
    } = queue.shift();
    try {
      const res = await fn();
      resolve(res);
    } catch (err) {
      reject(err);
    }
    
    activeCount--;
    
    await delay(interval);
    
    next();
  };

  return function throttle(fn) {
    return new Promise((resolve, reject) => {
      queue.push({
        resolve,
        reject,
        fn,
      });
      next();
    });
  };
};
