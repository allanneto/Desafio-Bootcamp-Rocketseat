import jwt from 'jsonwebtoken';

import { promisify } from 'util'; // promisify e uma funcao que esta na biblioteca util que vem por padrao dentro do node
// ele pega uma função de callback e transforma em uma funcao que pode utilizar asyn/await

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization; // Nessa linha estamos recebendo o valor do token armazenado no header.

  if (!authHeader) {
    res.status(401).json({ error: 'Token  not provided' });
  }

  const [, token] = authHeader.split(' '); // utilizando a desestruturação em um array para pegar o valor de token do header authorization

  try {
    // decoded recebera o valor retornado pelo jwt verify
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    // no promisify o primeiro parentese se o metodo que desejamos promissificar e isso ira se transformar em uma nova funcao,
    // o segundo parenteses serao os parametros da funcao promissificada, nesse caso so iremos passar os parametros execeto o callback.
    // no decoded nesse caso ficara o valor passado no primeiro parametro do sign no SessionController, nesse caso é o ID que podemos pegalo a aprtir do token enviado na req.
    req.userId = decoded.id;
    // podemos utilizar o req.userId no usercontroller a partir da execucao dessa autenticacao;
    return next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalid' });
  }

  return next();
};
