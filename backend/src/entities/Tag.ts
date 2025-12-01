import { Length } from "class-validator";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Ad from "./Ad";

@Entity()
export default class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Length(1, 100, {
    message: "Le nom doit contenir entre 5 et 100 caractères",
  })
  @Column({ length: 100 })
  name: string;

  @ManyToMany(
    () => Ad,
    (ad) => ad.tags,
  )
  ads: Ad[];
}
