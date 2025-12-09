import { IsUrl, Length, Min } from "class-validator";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ObjectId } from "../types";
import { Category } from "./Category";
import { Tag } from "./Tag";

@ObjectType()
@Entity()
export class Ad extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100 })
  title: string;

  @Field()
  @Column()
  price: number;

  @Field()
  @Column({ type: "text", nullable: true })
  description: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Category)
  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  category: Category;

  @Field(() => [Tag])
  @JoinTable()
  @ManyToMany(() => Tag)
  tags: Tag[];

  @Field()
  @Column({ length: 50 })
  location: string;

  @Field()
  @Column()
  @Length(10, 255)
  @IsUrl()
  pictureUrl: string;
}

@InputType()
export class NewAdInput {
  @Field()
  @Length(5, 50, { message: "Le titre doit contenir entre 5 et 50 caractères" })
  title: string;

  @Field()
  description: string;

  @Field()
  @Min(0, { message: "le prix doit etre positif" })
  price: number;

  @Field()
  location: string;

  @Field()
  @IsUrl()
  pictureUrl: string;

  @Field(() => ObjectId)
  category: ObjectId;

  @Field(() => [ObjectId], { nullable: true })
  tags?: ObjectId[];
}

@InputType()
export class UpdateAdInput {
  @Field({ nullable: true })
  @Length(5, 50, { message: "Le titre doit contenir entre 5 et 50 caractères" })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Min(0, { message: "le prix doit etre positif" })
  price?: number;

  @Field({ nullable: true })
  @IsUrl()
  pictureUrl?: string;

  @Field(() => ObjectId, { nullable: true })
  category?: ObjectId;

  @Field(() => [ObjectId], { nullable: true })
  tags?: ObjectId[];

  @Field({ nullable: true })
  location?: string;
}
