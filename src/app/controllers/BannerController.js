import Banner from '../models/banner';

class BannerController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const BannerFile = await Banner.create({
      name,
      path,
    });

    return res.json(BannerFile);
  }
}

export default new BannerController();
