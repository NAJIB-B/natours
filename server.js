const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log(err.name, err.message)
  console.log(err)
    process.exit(1)

})



const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log('DB successfully connected');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`running on port ${port}`);
});


process.on('unhandledRejection', err => {
  console.log(err.name, err.message)
  console.log(err)
  console.log('UNHANDLED REJECTION')
  server.close(() => {
    process.exit(1)
  }

  )
})

