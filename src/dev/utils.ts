import { asyncify, forEachOfLimit, mapLimit } from 'async';
import ProgressBar from 'progress';

/**
 *
 * @param items
 * @param asyncfn
 * @param rateLimit
 */
export const forEachHelper = async <T>(
  items: T[],
  asyncfn: (item: T) => Promise<void>,
  rateLimit: number
): Promise<void> => {
  const bar = new ProgressBar(':bar :current/:total', { total: items.length });
  await forEachOfLimit(items, rateLimit, async (item, key, callback) => {
    try {
      await asyncfn(item);
    } catch (error) {
      console.error(error);
      bar.interrupt(`failed on ${JSON.stringify(item)} at iteration ${key}\n`);
    } finally {
      bar.tick();
      callback();
      return;
    }
  });
};

export async function mapLimitProgressBar<T, R>(
  items: T[],
  asyncfn: (item: T) => Promise<R>,
  rateLimit: number
): Promise<R[]> {
  const bar = new ProgressBar(':bar :current/:total', { total: items.length });

  const iterator = async (item: T) => {
    try {
      const data = await asyncfn(item);
      bar.tick();
      return data;
    } catch (error) {
      console.error(error);
      bar.interrupt(`failed on ${JSON.stringify(item)} at iteration ${item}\n`);
    }
  };

  return await mapLimit(items, rateLimit, asyncify(iterator));
}
