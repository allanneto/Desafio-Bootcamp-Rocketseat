import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/sessionAuth';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello Dev!' });
});

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

export default routes;
