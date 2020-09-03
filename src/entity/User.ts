import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
      length: 100
  })
  fisrtName: string;

  @Column({
      length: 100
  })
  lastName: string;

  @Column("integer")
  age: number;

  @Column("float")
  weight: number;

}
