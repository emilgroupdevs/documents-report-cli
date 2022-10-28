import fs from 'fs';
import path from 'path';
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


export async function writeCsv(filename: string, data: ReportData[]) {
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
  } catch(error) {
    console.log('Could not write file. Content is: ' + lines);
  } finally {
    ws.close();
  }
}