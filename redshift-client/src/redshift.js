const {
  RedshiftDataClient,
  ExecuteStatementCommand,
  GetStatementResultCommand,
  DescribeStatementCommand
} = require(
    "@aws-sdk/client-redshift-data");

const {sleep} = require("./utils");

function getClient(redshiftConf) {
  const client = new RedshiftDataClient({region: redshiftConf.region});
  return client;
}

async function executeQuery(query, redshiftConf) {
  const client = getClient(redshiftConf);

  const command = new ExecuteStatementCommand({
    WorkgroupName: redshiftConf.workgroupName,
    Sql: query,
    SecretArn: redshiftConf.secretArn,
    Database: redshiftConf.database
  });

  return client.send(command);
}

async function getQueryData(Id, redshiftConf) {
  const client = getClient(redshiftConf);
  const input = {
    Id
  };
  const command = new GetStatementResultCommand(input);
  return client.send(command);
}

async function getQueryStatus(Id, redshiftConf) {
  const client = getClient(redshiftConf);
  const input = {
    Id
  };
  const command = new DescribeStatementCommand(input);
  return client.send(command);
}

async function executeQueryAndGetResult(query, redshiftConf) {
  const timeoutMs = 100;
  const maxRetries = 10;

  const queryResult = await executeQuery(query, redshiftConf);
  let bool = true;
  let retries = 0;
  while (bool) {
    const status = await getQueryStatus(queryResult.Id, redshiftConf);
    console.log(status.Status);
    if (status.Status === 'FINISHED') {
      bool = false;
    } else if (retries++ > maxRetries) {
      throw new Error('Query did not finish in time');
    } else {
      await sleep(timeoutMs)
    }
  }
  return getQueryData(queryResult.Id, redshiftConf);
}

module.exports = {
  executeQueryAndGetResult
};
