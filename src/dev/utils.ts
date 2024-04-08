import ProgressBar from 'progress';

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
