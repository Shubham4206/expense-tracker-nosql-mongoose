const Sequelize=require('sequelize').Sequelize;



const sequelize=new Sequelize(process.env.DATA_BASE_SCHEMANAME,process.env.DATA_BASE_ID,process.env.DATA_BASE_SECRETKEY,{
    dialect:'mysql',
    host:process.env.DATA_BASE_HOST
});

module.exports=sequelize;