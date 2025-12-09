import { Length } from "class-validator";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Ad } from "./Ad";

@ObjectType()
@Entity()
export class Category extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100 })
  @Length(2, 100)
  name: string;

  @OneToMany(
    () => Ad,
    (ad) => ad.category,
  )
  ads: Ad[];
}

@InputType()
export class NewCategoryInput {
  @Field()
  @Length(2, 20, { message: "Le nom doit contenir entre 2 et 20 caractères" })
  name: string;
}


@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true })
  @Length(2, 20, { message: "Le nom doit contenir entre 2 et 20 caractères" })
  name?: string;
}