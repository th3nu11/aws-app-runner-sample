const express = require('express');
const prettyHtml = require('json-pretty-html').default;
const {executeQueryAndGetResult} = require('./src/redshift');
const app = express();

const port = process.env.APP_PORT || 3000;

const redshiftConf = {
  region: process.env.REGION || 'eu-west-1',
  workgroupName: process.env.WORKGROUP_NAME,
  secretArn: process.env.SECRET_ARN,
  database: process.env.DATABASE
}

const query = `SELECT *
               FROM "dev"."public"."phrases" LIMIT 10;`;
app.get('/', async (req, res) => {
  const rawData = await executeQueryAndGetResult(query, redshiftConf);

  const data = rawData.Records.map(
      rec => rawData.ColumnMetadata.reduce((tot, col, index) => {
        tot[col.label] = rec[index].stringValue || rec[index].longValue;
        return tot;
      }, {}))

  res.send(
      `<div>Hello World, this is my first app runner application and this is my data (First 10 rows):</div><div>${prettyHtml(
          data, 2)}</div>`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});