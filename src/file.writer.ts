import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { DATE_FORMAT } from "../config/constant";
import dayjs from 'dayjs';
import { ReportData } from './report.interfaces';
const sep = path.sep;

export const CSV_COLUMN_NAMES = [
  'Dateiname des Dokuments',
  'Erstelldatum des Dokuments',
  'Dokumententyp',
  'Versicherungsscheinnummer',
  'Vor- und Nachname des Kunden',
  'Geburtsdatum des Kunden',
  'PLZ des Kunden',
  'Versicherungsbeginn',
];


export async function writeCsv(filename: string, data: ReportData[]): Promise<void> {
  const lines: string[] = data.map<string>((data) => {
    const formattedBirthDate = dayjs(data.account.birthDate).format(DATE_FORMAT);
    const formattedStartDate = dayjs(data.policy.startDate).format(DATE_FORMAT);

    const docInfo = `${data.document.description},${data.document.createdAt},${data.document.type}`
    const accountInfo = `${data.account.firstName} ${data.account.lastName},${formattedBirthDate},${data.account.plz}`

    return `${docInfo},${data.policy.number},${accountInfo},${formattedStartDate}\n`;
  })

  const firstLine = CSV_COLUMN_NAMES.join(',');

  const ws = fs.createWriteStream(filename);
  try {
    ws.write(`${firstLine}\n`);

    for (const line of lines) {
      ws.write(line);
    }
  } catch (error) {
    console.log('Could not write file. Content is: ' + lines);
  } finally {
    ws.close();
  }
}

export async function zipFolder(folderName: string): Promise<void> {
  // create a file to stream archive data to.
  const output = fs.createWriteStream(`report_${folderName}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function () {
    console.log('Data has been drained');
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);

  // append files from the sub-directory, putting its contents at the root of archive
  archive.directory(folderName, false);

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
  await archive.finalize();
}