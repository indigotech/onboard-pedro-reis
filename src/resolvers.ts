import * as jwt from 'jsonwebtoken';
import { getConnection } from 'typeorm';
import { User } from './entity/User';
import { CustomError } from './errors';
import { hashEncrypt } from './functions/functions';

export const resolvers = {
  Query: {
    info: () => 'Hello, Taqtiler!',
  },

  Mutation: {
    login: async (parent, args) => {
      const regExEmail = /\S+@\S+\.\S+/;
      if (!regExEmail.test(args.email)) {
        throw new CustomError('Formato de e-mail incorreto!', 401, 'Unauthorized');
      }

      let userRepository = getConnection().getRepository(User);
      let user = await userRepository.findOne({ email: args.email });
      if (!user) {
        throw new CustomError('Usuário não encontrado!', 401, 'Unauthorized');
      }

      const encryptedPassword = hashEncrypt(args.password);
      if (user.password != encryptedPassword) {
        throw new CustomError('Email e/ou senha incorretos!', 401, 'Unauthorized');
      }

      const token = jwt.sign({id: user.id}, 'supersecret', {expiresIn: args.remeberMe ? '7d': '1h'});
      return {
        user,
        token,
      }
    }
  }
}
