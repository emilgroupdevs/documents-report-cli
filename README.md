# Data api POC

`list-documents-poc` A simple Node project to fetch the list of documents from your Emil Insurance Suite that were created today or on a specific date.

## installation

To run the project, install it locally using npm:

```bash
npm install
```

## Config

```bash
export EMIL_USERNAME=example@emil.de ----------> Replace me
export EMIL_PASSWORD=SuperStrongPassword ----------> Replace me
export ENV=test
```

Export the ENVs to your terminal:

```bash
source .env
```

## Usage

```bash
npm run report csv
```

Passing a specific date:

```bash
npm run report csv -- -d=2022-10-24
```

The command will create 2022-10-24-report.csv as well as a directory `2022-10-24` at the root of the project.
