const dotenv = require('dotenv').config();
const mongoose=require('mongoose');
const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const cors=require('cors');
const helmet=require('helmet');
const compression=require('compression');
const path = require('path');
const fs=require('fs');
const morgan=require('morgan');




const userroute=require('./routes/user');
const expenseroute=require('./routes/expense');
const passwordroute=require('./routes/password');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    {flags: 'a'}
);



app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream: accessLogStream}));
app.use(bodyparser.urlencoded());
app.use(bodyparser.json());
app.use(cors());


app.use('/user',userroute);
app.use('/expense',expenseroute);
app.use('/password',passwordroute);












mongoose.connect(process.env.MONGO_UI) ;
app.listen(4000);











