import { Length } from "class-validator";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Ad } from "./Ad";

@Entity()
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Length(2, 100)
  name: string;

  @ManyToMany(
    () => Ad,
    (ad) => ad.tags,
  )
  ads: Ad[];
}
