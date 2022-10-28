import { AccountClass, AccountsApi, Environment } from '@emilgroup/account-sdk-node';
import { DocumentClass, DocumentsApi, DocumentsApiListDocumentsRequest } from '@emilgroup/document-sdk-node';
import {
  PoliciesApi, PolicyClass,
} from '@emilgroup/insurance-sdk-node';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../config/constant';
import fs from 'fs';
import path from  'path';
import { downloadFile } from './download';
import { DocumentReport, PolicyReport, AccountReport, ReportData } from './report.interfaces';
import cliProgress from 'cli-progress';

const sep = path.sep;

const documentsApi = new DocumentsApi();
const accountsApi = new AccountsApi();
const policiesApi = new PoliciesApi();
const environment = process.env.ENV === 'production' ? Environment.Production : Environment.Test;

async function getDocumentsInDay(date: Date, pageToken?: string) {
  const createdAt = dayjs(date).format(DATE_FORMAT);

  const params: DocumentsApiListDocumentsRequest = {
    filter: `createdAt=${createdAt}`,
    pageToken,
  };

  return getDocuments(params);
}

async function getDocuments(params?: DocumentsApiListDocumentsRequest) {
  console.log(`Fetching and processing documents for page ${params?.pageToken || '1'}`);

  const {
    data: { items, nextPageToken },
  } = await documentsApi.listDocuments(params);

  return { items, nextPageToken };
}

async function getAccount(code: string) {
  const {
    data: { account },
  } = await accountsApi.getAccount({ code });

  return account;
}

async function getPolicy(code: string) {
  const {
    data: { policy },
  } = await policiesApi.getPolicy({ code });

  return policy;
}

async function getData(
  date: Date,
  data: any[] = [],
  pageToken?: string
): Promise<ReportData[]> {
  await accountsApi.initialize(environment);
  await policiesApi.initialize(environment);
  await documentsApi.initialize(environment);

  const { items, nextPageToken } = await getDocumentsInDay(date, pageToken);

  if (!items) {
    console.log(`No document created ${dayjs(date).format(DATE_FORMAT)}`);

    return Promise.resolve([]);
  }

  const loadingBar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
  loadingBar.start(100, 0);

  let i = 1;

  for (const document of items) {
    const { policyCode } = document as DocumentClass;

    if (!policyCode) {
      console.log(`No policy attached to document ${document.code}`)
      continue;
    }

    try {
      // fetch policy information
      const policy = await getPolicy(policyCode);
      // fetch account information
      const account = await getAccount(policy.accountCode);

      // build necessary data
      const d = {
        policy: buildPolicyData(policy),
        account: buildAccountData(account),
        document: buildDocumentData(document),
      };
      data.push(d);

      // fetch download url to download the document
      const { data: { url: downloadUrl }} = await documentsApi.getDocumentDownloadUrl({ code: document.code });
      await downloadDocument(date, downloadUrl, document, policy);

      loadingBar.update(i * (100 / items.length));
      i++;
    } catch(err) {
      console.log(`Could not get information for ${policyCode}`);
    }
  }

  loadingBar.stop();

  if (nextPageToken) {
    return getData(date, data, nextPageToken);
  }
  
  return Promise.resolve([]);
}

async function downloadDocument(date: Date, downloadUrl: string, document: DocumentClass, policy: PolicyClass) {
  const { policyNumber } = policy;
  const { contentType, description } = document;
  const dateDir = dayjs(date).format(DATE_FORMAT);

  if (!fs.existsSync(dateDir)) {
    await fs.promises.mkdir(dateDir);
  }
  
  const targetFile = `${dateDir}${sep}${policyNumber}_${description}.${contentType}`;

  return downloadFile(downloadUrl, targetFile);
}

function buildPolicyData(policy: any): PolicyReport {
  return {
    number: policy.policyNumber,
    startDate: policy.policyStartDate,
  }
}

function buildDocumentData(document: DocumentClass): DocumentReport {
  return {
    createdAt: document.createdAt,
    description: document.description,
    type: document.entityType,
  }
}

function buildAccountData(account: AccountClass): AccountReport {
  return {
    birthDate: account.birthDate,
    firstName: account.firstName,
    lastName: account.lastName,
    plz: account.zipCode,
  }
}

export async function execute(date: Date) {
  const reportData: any[] = [];
  await getData(date, reportData);

  return reportData;
}
