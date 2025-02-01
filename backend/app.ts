import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// Body parser middleware'lerini doğru sırayla ekleyin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// veya
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 