import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from './entity/User';
import { CustomError } from './errors';
import { hashEncrypt, verifyToken } from './functions';

export const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      verifyToken(context.request.headers.authorization);

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ id: args.id });

      if (!user) {
        throw new CustomError('Usuário não encontrado!', 404, 'user id not found')
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        cpf: user.cpf
      }
    },

    users: async (parent, args, context) => {
      verifyToken(context.request.headers.authorization);

      const quantity = args.quantity ?? 5;
      const skip = args.skip ?? 0;
      if (quantity < 0 || skip < 0) {
        throw new CustomError('A quantidade e o offset devem ser positivos', 400, 'bad request');
      }

      const userRepository = getRepository(User);
      const userCount = await userRepository.count();

      const before = skip !== 0;
      const after = userCount > quantity + skip;

      const users = await userRepository
        .createQueryBuilder("user")
        .orderBy("user.name", "DESC")
        .take(quantity)
        .skip(skip)
        .getMany();

      return {
        users,
        userCount,
        before,
        after
      }
    }
  },

  Mutation: {
    login: async (parent, args, context) => {
      const regExEmail = /\S+@\S+\.\S+/;
      if (!regExEmail.test(args.email)) {
        throw new CustomError('Formato de e-mail incorreto!', 400, 'Bad Request');
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ email: args.email });
      if (!user) {
        throw new CustomError('Usuário não encontrado!', 401, 'Unauthorized');
      }

      const encryptedPassword = hashEncrypt(args.password);
      if (user.password !== encryptedPassword) {
        throw new CustomError('Email e/ou senha incorretos!', 401, 'Unauthorized');
      }

      const token = jwt.sign({id: user.id}, process.env.TOKEN_SECRET, {expiresIn: args.remeberMe ? '7d': '1h'});
      return {
        user,
        token,
      }
    },

    createUser : async (parent, args, context) => {
      verifyToken(context.request.headers.authorization);

      const userRepository = getRepository(User);
      let user = await userRepository.findOne({ email: args.user.email });
      if (user) {
        throw new CustomError('Usuário já está cadastrado!', 409, 'email already registered');
      }

      const regExPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{7,}$/
      if (!regExPassword.test(args.user.password)){
        throw new CustomError('Senha fraca!', 400, 'weak password');
      }

      user = new User();
      user.name = args.user.name;
      user.email = args.user.email;
      user.birthDate = args.user.birthDate;
      user.cpf = args.user.cpf;
      user.password = hashEncrypt(args.user.password);

      user = await userRepository.save(user);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        cpf: user.cpf,
      };
    }
  }
}


