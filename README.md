# Data api POC

`documents-report-cli` A simple Node project to fetch the list of documents from your Emil Insurance Suite that were created today or on a specific date.

## installation

To run the project, install it locally using npm:

```bash
npm install
```

## Config
### Env variables

```bash
export EMIL_USERNAME=example@emil.de ----------> Replace me
export EMIL_PASSWORD=SuperStrongPassword ----------> Replace me
export ENV=test
```

Export the ENVs to your terminal:

```bash
source .env
```

### Credential file

You can also provide a configuration file under ~/.emil/credentials with the following content:

```bash 
emil_username=XXXXX@XXXX.XXX
emil_password=XXXXXXXXXXXXXX
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
