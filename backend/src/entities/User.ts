import { IsEmail, IsStrongPassword } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
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
  // Text PK — better-auth supplies its own UUID string; we must not let Postgres
  // auto-generate one, otherwise better-auth's supplied id would be ignored.
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

  // Avatar URL from OAuth provider, if any.
  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  image: string | null;

  // Hidden from GraphQL — only used for email/password login.
  // Empty string for OAuth/passkey-only users.
  @Column({ default: "" })
  hashedPassword: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ enum: UserRole, default: UserRole.Visitor })
  role: Role;

  @Field()
  @Column({
    default:
      "https://media.istockphoto.com/id/1300845620/fr/vectoriel/appartement-dic%C3%B4ne-dutilisateur-isol%C3%A9-sur-le-fond-blanc-symbole-utilisateur.jpg?s=612x612&w=0&k=20&c=BVOfS7mmvy2lnfBPghkN__k8OMsg7Nlykpgjn0YOHj0=",
  })
  avatar: string;
}

@InputType()
export class SignupInput {
  @Field()
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;

  @Field()
  @IsStrongPassword(
    {},
    {
      message:
        "Le mot de passe doit contenir au moins 8 caractères, dont une minuscule, une majuscule, un chiffre et un caractère spécial",
    },
  )
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;

  @Field()
  @IsStrongPassword(
    {},
    {
      message:
        "Le mot de passe doit contenir au moins 8 caractères, dont une minuscule, une majuscule, un chiffre et un caractère spécial",
    },
  )
  password: string;
}
