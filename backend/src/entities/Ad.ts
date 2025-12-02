import { Length, Min } from "class-validator";
import {
  BaseEntity,
  Column, CreateDateColumn, Entity,
  PrimaryGeneratedColumn
} from "typeorm";

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

  @Column({ length: 50 })
  @Length(2, 50)
  location: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column()
  @Length(10, 255)
  pictureUrl: string

  @CreateDateColumn()
  createdAt: Date
}
