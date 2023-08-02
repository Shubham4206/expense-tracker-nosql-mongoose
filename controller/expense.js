const Expense = require('../model/expense');
const User = require('../model/user');
const Download = require('../model/download');
const AWS = require('aws-sdk');

exports.addExpense = async (req, res, next) => {
  const { amount, description, category } = req.body;
  if (amount.length > 0 && description.length > 0 && category.length > 0) {
    try {
      const totalexpense = Number(req.user.totalExpense) + Number(amount);
      await req.user.updateOne({ totalExpense: totalexpense });

      const newExpense = await Expense.create({
        amount: amount,
        description: description,
        category: category,
        user: req.user._id,
      });
      // await newExpense.save();

      res.status(200).json(newExpense);
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }
};

exports.getExpense = async (req, res, next) => {
  const page = Number(req.query.page);
  const ITEMS_PER_PAGE = +req.header('rows');

  try {
    const limitedExpenses = await Expense.find({ user: req.user._id })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const totalItems = await Expense.countDocuments({ user: req.user._id });
    const lastPage = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    res.status(200).json({
      expenses: limitedExpenses,
      totalExpenses: totalItems,
      currentPage: page,
      hasNextPage: (page * ITEMS_PER_PAGE) < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: lastPage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const uid = req.params.id;
  const amount = req.params.amount;
  const totalexpense = Number(req.user.totalExpense) - Number(amount);

  try {
    await Expense.deleteOne({ _id: uid });
    await User.updateOne({ _id: req.user._id }, { totalExpense: totalexpense });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.getLeaderboard = async (req, res, next) => {
  if (req.user.isPremiumUser === true) {
    try {
      const users = await User.find({}, 'id name totalExpense').sort({ totalExpense: -1 });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(403).json({ success: false, message: 'user does not have premium membership' });
  }
};

exports.downloadExpense = async (req, res) => {
  if (req.user.isPremiumUser) {
    try {
      const expenses = await Expense.find({ user: req.user._id });
      const fileUrl = await uploadToS3(`${req.user._id}_${new Date()}_expenses.csv`, JSON.stringify(expenses));

      await Download.create({ fileUrl: fileUrl, date: new Date(),user:req.user._id });

      res.status(201).json({ fileUrl: fileUrl, success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  } else {
    res.status(401).json({ success: false, message: 'user does not have Premium Membership' });
  }
};

function uploadToS3(fileName, data) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  const params = {
    Bucket: 'expensetrackin', // pass your bucket name
    Key: fileName, // file will be saved as expense-tracker-archie/<fileName>
    Body: data,
    // ACL: 'public-read'
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, response) => {
      if (err) {
        reject(err);
      } else {
        console.log(response.Location);
        resolve(response.Location);
      }
    });
  });
}

exports.getMonthExpense = async (req, res, next) => {
  const { month_, year_ } = req.body;

  try {
    const data = await Expense.find({
      user: req.user._id,
      createdAt: {
        $gte: new Date(`${year_}-${month_}-1`),
        $lt: new Date(`${year_}-${month_}-1`).setMonth(new Date(`${year_}-${month_}-01`).getMonth() + 1),
      },
    });
   console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDayExpense = async (req, res, next) => {
  const { day_, month_, year_ } = req.body;
 
  try { 
    // Parse the input date components to create a Date object
    const startDate = new Date(`${year_}-${month_}-${day_}`);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Set endDate to the next day

    // Use Mongoose query builder to filter expenses
    const data = await Expense.find({
      user: req.user._id,
      createdAt: { $gte: startDate, $lt: endDate },
    });

    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



