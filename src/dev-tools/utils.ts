import ProgressBar from 'progress';
import async from 'async';

export const forEachHelper = async <T>(items: T[], asyncfn: (item: T) => void, rateLimit: number) => {
  const bar = new ProgressBar(':bar :current/:total', { total: items.length });
  await async.forEachOfLimit(items, rateLimit, async (item, key, callback) => {
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
