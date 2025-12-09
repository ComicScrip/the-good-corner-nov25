import { IsUrl, Length, Min } from "class-validator";
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
import { Category } from "./Category";
import { Tag } from "./Tag";

@Entity()
export class Ad extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Length(2, 100)
  title: string;

  @Column()
  @Min(0)
  price: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Category)
  category: Category;

  @JoinTable()
  @ManyToMany(() => Tag)
  tags: Tag[];

  @Column({ length: 50 })
  @Length(1, 50)
  location: string;

  @Column()
  @Length(10, 255)
  @IsUrl()
  pictureUrl: string;
}

