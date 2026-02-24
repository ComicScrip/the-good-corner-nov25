import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export const UserRole = {
  Admin: "admin",
  Visitor: "visitor",
} as const;

export type Role = (typeof UserRole)[keyof typeof UserRole];

@ObjectType()
@Entity()
export class User extends BaseEntity {
  // Text PK — better-auth supplies its own UUID string.
  @Field(() => ID)
  @PrimaryColumn("text")
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  // Nullable: email/password users don't have a name from the signup form.
  // better-auth populates this for OAuth/passkey users.
  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  name: string | null;

  // Set by better-auth when the user verifies their email (OAuth users start as true).
  @Field()
  @Column({ default: false })
  emailVerified: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ enum: UserRole, default: UserRole.Visitor })
  role: Role;

  // better-auth uses "image" as the field name for OAuth profile pictures.
  @Field(() => String, { nullable: true })
  @Column({
    type: "text",
    nullable: true,
    default: null,
  })
  image: string | null;
}
