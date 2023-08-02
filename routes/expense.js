const express=require('express');
const router=express.Router();
 const expensecontroller=require('../controller/expense');
 const authenticate=require('../middleware/authenticate');

router.post('/addexpense',authenticate.authentication,expensecontroller.addExpense);
router.post('/monthexpense',authenticate.authentication,expensecontroller.getMonthExpense);
router.post('/dayexpense',authenticate.authentication,expensecontroller.getDayExpense);
router.get('/getexpense',authenticate.authentication,expensecontroller.getExpense);
router.delete('/deleteexpense/:id/:amount',authenticate.authentication,expensecontroller.deleteExpense);
router.get('/get-leaderboard',authenticate.authentication,expensecontroller.getLeaderboard);
router.get('/download', authenticate.authentication, expensecontroller.downloadExpense);







module.exports=router;