import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/sessionAuth';
import BannerController from './app/controllers/BannerController';
import MeetupController from './app/controllers/MeetupController';

const routes = new Router();

const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello Dev!' });
});

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/banners', upload.single('banners'), BannerController.store);

routes.post('/meetups', MeetupController.store);
routes.put('/meetups', MeetupController.update);
routes.get('/meetups', MeetupController.index);
routes.delete('/meetups', MeetupController.delete);

export default routes;
