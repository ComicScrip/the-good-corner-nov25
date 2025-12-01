import { Length } from "class-validator";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Ad from "./Ad";

@Entity()
export default class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Length(1, 100, {
    message: "Le nom doit contenir entre 5 et 100 caractères",
  })
  name: string;

  @OneToMany(
    () => Ad,
    (ad) => ad.category,
  )
  ads: Ad[];
}
