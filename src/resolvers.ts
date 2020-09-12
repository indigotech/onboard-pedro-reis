import { createSecureServer } from 'http2';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from './entity/User';
import { CustomError } from './errors';
import { hashEncrypt } from './functions/functions';

export const resolvers = {
  Query: {
    info: () => 'Hello, Taqtiler!',
  },

  Mutation: {
    login: async (parent, args, context) => {
      const regExEmail = /\S+@\S+\.\S+/;
      if (!regExEmail.test(args.email)) {
        throw new CustomError('Formato de e-mail incorreto!', 401, 'Unauthorized');
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ email: args.email });
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
    },

    createUser : async (parent, args, context) => {
      const token = context.request.headers.authorization;
      let tokenValidation;

      try {
        tokenValidation = jwt.verify(token, 'supersecret');
        if (!tokenValidation.id){
          throw new Error;
        }
      } catch(err) {
        throw new CustomError('Usuário não autenticado! Faça seu login!', 401, 'invalid token');
      }

      const userRepository = getRepository(User);
      let user = await userRepository.findOne({ email: args.user.email });
      if (user) {
        throw new CustomError('Usuário já está cadastrado!', 401, 'email already registered');
      }

      const regExPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{7,}$/
      if (!regExPassword.test(args.user.password)){
        throw new CustomError('Senha fraca!', 401, 'weak password');
      }

      user = new User();
      user.name = args.user.name;
      user.email = args.user.email;
      user.birthDate = args.user.birthDate;
      user.cpf = args.user.cpf;
      user.password = hashEncrypt(args.user.password);

      await userRepository.save(user);

      user = await userRepository.findOne({ email: args.user.email });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        cpf: user.cpf,
        password: user.password
      };
    }
  }
}


