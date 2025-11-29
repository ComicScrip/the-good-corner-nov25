import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import Ad from "./Ad";
import { Length } from "class-validator";

@Entity()
export default class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Length(1, 100, {
    message: "Le nom doit contenir entre 5 et 100 caractères",
  })
  name: string;

  @OneToMany(() => Ad, (ad) => ad.category)
  ads: Ad[];
}
