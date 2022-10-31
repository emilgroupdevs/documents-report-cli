/* eslint-disable class-methods-use-this */

import * as yargs from 'yargs';
import rimraf from 'rimraf';
import fs from 'fs';
import { Argv } from 'yargs';
import dayjs from 'dayjs';
import { execute } from '../helper';
import { writeCsv, zipFolder } from '../file.writer';

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

      if (data.length) {
        const dateFormatted = dayjs(date).format('YYYY-MM-DD');

        const filename = `report_${dateFormatted}.csv`;

        // create the report CSV
        await writeCsv(filename, data);

        // Zip all files
        await zipFolder(dateFormatted);

        // Deletes the directory.
        // comment if you want to keep both zip and the directory.
        rimraf(dateFormatted, (error) => { console.log(error); });
      }

      console.log('Done.')
    } catch (err) {
      console.error('Error during run:');
      console.error(err);
      process.exit(1);
    }
  }
}
