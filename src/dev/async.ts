import ProgressBar from 'progress';

/**
 * Helper function to iterate over an array of items and execute an async function on each item
 * @param items Array of items to iterate over
 * @param asyncfn Async function to execute on each item
 * @param rateLimit Number of concurrent async functions to run
 * @example
 * const items = [1, 2, 3, 4, 5];
 * const asyncfn = async (item: number) => {
 *  await new Promise((resolve) => setTimeout(resolve, 1000));
 *  console.log(item);
 * };
 * forEachHelper(items, asyncfn, 2);
 */
export const forEachHelper = async <T>(items: T[], asyncfn: (item: T) => void, rateLimit: number): Promise<void> => {
  const bar = new ProgressBar(':bar :current/:total', { total: items.length });

  const pool = new Array(rateLimit).fill(Promise.resolve());

  items.forEach((item, i) => {
    let p = pool[i % rateLimit];
    pool[i % rateLimit] = p.then(async () => {
      try {
        await asyncfn(item);
      } catch (error) {
        console.error(error);
        bar.interrupt(`failed on ${JSON.stringify(item)} at iteration ${i}\n`);
      } finally {
        bar.tick();
      }
    });
  });

  await Promise.all(pool);
};
