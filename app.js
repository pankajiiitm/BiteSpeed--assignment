import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/identifyRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(router);


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });