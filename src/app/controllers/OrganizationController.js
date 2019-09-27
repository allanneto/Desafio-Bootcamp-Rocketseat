import Meetup from '../models/meetup';

class OrganizationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const meetup = await Meetup.findAll({
      where: { creator_id: req.userId },
      limit: 20,
      offset: (page - 1) * 20,
    });

    /**
     * Check if user don't have meetups
     */

    if (meetup.length === 0) {
      return res.json({ message: "You don't have meetups registered" });
    }

    return res.json(meetup);
  }
}
export default new OrganizationController();
