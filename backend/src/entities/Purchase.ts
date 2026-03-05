import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Ad } from "./Ad";
import { User } from "./User";

export enum PurchaseStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
}

registerEnumType(PurchaseStatus, { name: "PurchaseStatus" });

@ObjectType()
@Entity()
export class Purchase extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Ad)
  @ManyToOne(() => Ad, { onDelete: "CASCADE" })
  ad: Ad;

  @Field(() => User)
  @ManyToOne(() => User)
  buyer: User;

  @Field()
  @Column({ type: "text" })
  stripeSessionId: string;

  @Field(() => PurchaseStatus)
  @Column({ type: "text", default: PurchaseStatus.Pending })
  status: PurchaseStatus;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
