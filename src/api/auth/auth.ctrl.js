import Joi from 'joi';
import User from '../../models/user.js';

/* POST /api/auth/register */
export const register = async (req, res) => {
  // validate request body
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(req.body);
  if (result.error) {
    res.status(400);
    console.log(result.error);
    res.send({ Error: 'Invalid! check console log' });
    return;
  }

  const { username, password } = req.body;
  try {
    // confirm exist id
    const exists = await User.findByUsername(username);
    if (exists) {
      res.status(409); // conflict
      res.send({ error: 'Username already exists' });
      console.log('Error!');
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password);
    await user.save();

    const data = user.serialize();

    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    res.send(data);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/* POST /api/auth/login */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401);
    res.send({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      res.status(401);
      res.send({ error: 'Username not exist' });
      return;
    }
    const valid = await user.checkPassword(password);
    if (!valid) {
      res.status(401);
      res.send({ error: 'Invalid password' });
      return;
    }

    const data = user.serialize();

    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    res.send(data);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/* GET /api/auth/check */
export const check = async (req, res) => {
  const { user } = res.locals;
  if (!user) {
    res.status(401);
    res.send({ error: 'Unauthorized' });
    return;
  }
  res.send(user);
};

/* POST /api/auth/logout */
export const logout = async (req, res) => {
  res.clearCookie('access_token');
  res.status(204).send();
};
