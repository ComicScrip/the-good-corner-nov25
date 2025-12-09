import { Length } from "class-validator";
import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Ad } from "./Ad";

@ObjectType()
@Entity()
export class Tag extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100 })
  @Length(2, 100)
  name: string;

  @Field(() => [Ad])
  @ManyToMany(
    () => Ad,
    (ad) => ad.tags,
  )
  ads: Ad[];
}
