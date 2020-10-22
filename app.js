require('dotenv').config();
const mongoose = require('mongoose');
const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(bodyParser.json({ limit: '6mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '6mb',
    extended: true,
    parameterLimit: 50000,
  })
);

//for request logging
app.use(morgan('dev'));

//importing mongoose models
const { Organisation, Worker, User } = require('./models');

const workerRouter = require('./routes/worker');
const userRouter = require('./routes/user');

mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  await Promise.all([Organisation.init(), Worker.init(), User.init()]);
  console.log('db connected');
  app.use('/worker', workerRouter);
  app.use('/user', userRouter);
});

const port = process.env.PORT || 3000;
app.listen(port);
