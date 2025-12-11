import { Field, Int, ObjectType, InputType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Ad } from "./Ad";
import { Length } from "class-validator";

@ObjectType()
@Entity()
export class Tag extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100 })
  name: string;

  @ManyToMany(
    () => Ad,
    (ad) => ad.tags,
  )
  ads: Ad[];
}

@InputType()
export class NewTagInput {
  @Field()
  @Length(2, 20, { message: "Le nom doit contenir entre 2 et 20 caractères" })
  name: string;
}