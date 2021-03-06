const Router = require('express').Router();
const User = require('../models/User');
const checkAuth = require('../middlewares/checkAuth');

Router.get('/', checkAuth, (req, res) => {
  User.findOne({ userUUID: req.user.user_id })
    .populate('organisations')
    .exec(function (err, result) {
      if (result) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json({
          message: 'user not found',
        });
      }
    });
});

Router.post('/', checkAuth, async (req, res) => {
  const { userInfo } = req.body;
  const name = userInfo.name;
  const userUUID = req.user.user_id;
  const mobile = req.user.phone_number;
  const user = new User({
    name,
    userUUID,
    mobile,
  });
  try {
    await user.save();
    return res.json(user);
  } catch (err) {
    return res.json({ ...err, message: err.message });
  }
});

module.exports = Router;
