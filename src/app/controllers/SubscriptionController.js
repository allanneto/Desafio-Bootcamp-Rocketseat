import { Op } from 'sequelize';
import * as Yup from 'yup';
import { isBefore } from 'date-fns';
import Meetup from '../models/meetup';
import User from '../models/user';
import Subscription from '../models/subscription';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const subscription = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id', 'meetup_id'],
      include: [
        {
          model: Meetup,
          required: true,
          as: 'meetup',
          where: {
            // verify if meetup date is greater than new date
            date: {
              [Op.gt]: new Date(),
            },
          },
          attributes: ['id', 'date', 'creator_id', 'title', 'description'],
        },
      ],
      order: [['meetup', 'date']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(subscription);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      meetup_id: Yup.string().required(),
    });

    /**
     * Check if Schema is Valid!
     */

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const { meetup_id } = req.body;

    const meetup = await Meetup.findByPk(meetup_id);
    const user = await User.findByPk(req.userId);
    const meetupcreator = await User.findByPk(meetup.creator_id);

    if (!meetup) {
      return res
        .status(400)
        .json({ error: 'The meetup_id not exists in database' });
    }

    /**
     * Check if user not is the meetup creator
     */

    if (req.userId === meetup.creator_id) {
      return res.status(400).json({
        error:
          "You can not subscribe in this meetup, because you're the creator",
      });
    }

    if (isBefore(meetup.date, new Date())) {
      /**
       * Check if meetup is avaiable for subscriptions
       */

      return res
        .status(400)
        .json({ error: 'This meetup is not avaiable for new subscriptions' });
    }

    /**
     * Check if user is already subscript in meetup informed
     */

    const alreadySubscript = await Subscription.findOne({
      where: {
        meetup_id,
        user_id: req.userId,
      },
    });

    if (alreadySubscript) {
      return res
        .status(400)
        .json({ error: 'You already subscripted in this meetup' });
    }

    /**
     * Check if user trying to subscript in 2 meetups at the same time
     */

    const checkDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          as: 'meetup',
          where: { date: meetup.date },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: ' You already subscripted in a meetup at this hour ' });
    }

    const subscript = await Subscription.create({
      meetup_id,
      user_id: req.userId,
    });

    /**
     * Send the subscription email to meetup creatore
     */

    // const infoMeetup = await Meetup.findByPk(meetup_id, {
    //   include: {
    //     model: User,
    //     as: 'user',
    //     where: { id: meetup.creator_id },
    //     attributes: ['name', 'email'],
    //   },
    // });

    await Queue.add(SubscriptionMail.key, {
      user,
      meetup,
      meetupcreator,
    });

    return res.json({
      OK: 'You have subscribed in meetup',
      subscript,
    });
  }
}

export default new SubscriptionController();
