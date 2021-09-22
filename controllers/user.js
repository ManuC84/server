const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
var { jwtSecret } = require('../config/config.js');

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let errorMessages = {
      emailError: '',
      passwordError: '',
    };

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      errorMessages.emailError = "User doesn't exist";
      return res.status(400).json(errorMessages);
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordCorrect) {
      errorMessages.passwordError = 'Invalid password';
      return res.status(400).json(errorMessages);
    }

    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
      },
      jwtSecret,
      { expiresIn: '1h' },
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.signup = async (req, res) => {
  const { email, password, repeatPassword, userName } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    const existingUser = await User.findOne({ name: userName });

    let errorMessages = {
      userNameError: '',
      emailError: '',
      passwordError: '',
    };

    if (existingUser)
      errorMessages.userNameError = 'User name is already taken';

    if (existingEmail)
      errorMessages.emailError = 'An user with that email already exists';

    if (password !== repeatPassword)
      errorMessages.passwordError = "Passwords don't match";

    if (
      errorMessages.userNameError ||
      errorMessages.emailError ||
      errorMessages.passwordError
    )
      return res.status(400).json(errorMessages);

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      name: userName,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, jwtSecret, {
      expiresIn: '1h',
    });

    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.uploadFile = async (req, res) => {
  const { file, userId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { imageUrl: file });
  } catch (error) {
    res.status(404).send();
  }
};
