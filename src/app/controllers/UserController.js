import * as Yup from 'yup';

import User from '../models/user';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });
    if (!(await schema.isValid(req.body))) {
      const { password } = req.body;

      if (password.length < 6) {
        return res.status(400).json({
          error: 'The password must be contains 6 caracters or more!',
        });
      }
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const userVerify = await User.findOne({ where: { email: req.body.email } });

    if (userVerify) {
      return res.status(400).json({ error: 'E-mail already exists' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      currentPassword: Yup.string(),
      // changePassword: Yup.boolean()
      //   .required()
      //   .default(false),
      password: Yup.string()
        .min(6)
        .when('currentPassword', (currentPassword, field) =>
          currentPassword ? field.required() : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { email, currentPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userVerify = await user.findOne({
        where: { email: req.body.email },
      });

      if (userVerify) {
        return res.status(400).json({ error: 'E-mail already exists' });
      }
    }

    if (currentPassword && !(await user.checkPassword(currentPassword))) {
      return res.status(400).json({ error: 'Password does not match' });
    }
    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
