/* eslint-disable class-methods-use-this */

import * as yargs from 'yargs';
import { Argv } from 'yargs';
import dayjs from 'dayjs';
import { execute } from '../helper';
import { writeCsv } from '../csv.writer';

export default class CsvCommand implements yargs.CommandModule {
  command = 'csv';

  describe = 'Generate report in csv format';

  static builder(args: yargs.Argv): Argv['option'] {
    console.log(args)
    return args.option('date', {
      string: true,
      alias: 'd',
      desc: 'Set report date in format: YYYY-MM-DD',
      requiresArg: true
    });
  }

  async handler(args: yargs.Arguments): Promise<void> {
    try {
      let date = dayjs().toDate();
      console.log(args)

      if (args.d) {
        date = dayjs(args.d as string).toDate();
      }

      const data = await execute(date);

      const filename = `report_${dayjs(date).format('YYYY-MM-DD')}.csv`;

      await writeCsv(filename, data);

      console.log('Done.')
    } catch (err) {
      console.error('Error during run:');
      console.error(err);
      process.exit(1);
    }
  }
}
