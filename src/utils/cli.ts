import yargs from 'yargs/yargs';
import { coursesUtil } from './kuali-dump';
import { scheduleUtil } from './schedule-dump';

const argv = yargs(process.argv.slice(2)).options({
  term: { type: 'string', demandOption: true, description: 'term eg. 202009' },
  type: {
    alias: 't',
    choices: ['courses', 'schedules', 'class'] as const,
    demandOption: true,
    description: 'dump target type',
  },
  update: { type: 'boolean', default: false, alias: 'u' },
}).argv;

const handleClass = async () => {
  console.error('not implemented yet!');
  return 0;
};

const main = async () => {
  switch (argv.type) {
    case 'courses':
      await coursesUtil();
      break;
    case 'schedules':
      await scheduleUtil(argv.term);
      break;
    case 'class':
      await handleClass();
      break;
  }
};
main();
