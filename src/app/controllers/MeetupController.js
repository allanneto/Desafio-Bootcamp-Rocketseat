import * as Yup from 'yup';
import { isBefore, subDays, parseISO } from 'date-fns';
import Meetup from '../models/meetup';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    const { date, title, description, localization, banner_id } = req.body;

    /**
     * Check if Schema is Valid!
     */

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    /**
     * Check if meetup have 1 day of advance in creation
     */

    const meetupDateSub = subDays(parseISO(date), 1);

    console.log(meetupDateSub);

    if (isBefore(meetupDateSub, new Date())) {
      return res
        .status(400)
        .json({ error: 'You only can create a meetup with 1 day advance' });
    }

    /**
     * Check date avaiability
     */

    const meetupDate = parseISO(date);

    const dateAvaiable = await Meetup.findOne({
      where: {
        canceled_at: null,
        date: meetupDate,
      },
    });

    if (dateAvaiable) {
      return res.status(400).json({
        error: 'Meetup date is not avaiable',
      });
    }

    const meetup = await Meetup.create({
      creator_id: req.userId,
      date,
      title,
      description,
      localization,
      banner_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      title: Yup.string(),
      description: Yup.string(),
      localization: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    const { id } = req.body;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    /**
     * Verify if user is the creator of meetup and meetup date has passed
     */

    const meetup = await Meetup.findByPk(id);

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({
        error: "You can't update this meetup, since the date have passed. ",
      });
    }

    if (req.userId !== meetup.creator_id) {
      return res
        .status(401)
        .json({ error: "You don't have permission for update this meetup." });
    }

    /**
     * Check date avaiability if date is mentioned by user
     */

    if (req.body.date) {
      const { date } = req.body;

      const meetupDate = parseISO(date);

      const dateAvaiable = await Meetup.findOne({
        where: {
          canceled_at: null,
          date: meetupDate,
        },
      });

      if (dateAvaiable) {
        return res.status(400).json({
          error: 'Meetup date is not avaiable',
        });
      }
    }
    const {
      date,
      title,
      description,
      localization,
      banner_id,
    } = await meetup.update(req.body);

    return res.json({
      OK: 'Meetup Updated',
      Meetup: { id, date, title, description, localization, banner_id },
    });
  }

  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { creator_id: req.userId },
      order: ['date'],
      attributes: ['title', 'localization', 'date'],
    });

    /**
     * Check if user don't have meetups
     */

    if (meetups.length === 0) {
      return res.json({ message: "You don't have meetups registered" });
    }

    return res.json(meetups);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    /**
     * Check if user logged is the appointment creator
     */

    const { id } = req.body;

    const meetup = await Meetup.findByPk(id);

    if (req.userId !== meetup.creator_id) {
      return res
        .status(401)
        .json({ error: "You can't cancel an meetup created by other user" });
    }

    /**
     * Check if meetup date have passed
     */

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({
        error: "You can't update this meetup, since the date have passed. ",
      });
    }

    meetup.destroy(); // Model.destroy() apaga a linha correspondente da nossa DB.

    return res.json({ ok: true });
  }
}

export default new MeetupController();
