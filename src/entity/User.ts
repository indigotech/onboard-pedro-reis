import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 10 })
  birthDate: string;

  @Column({ length: 11 })
  cpf: string;

}
