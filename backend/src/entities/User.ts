import { IsEmail, IsStrongPassword } from "class-validator";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export const UserRole = {
  Admin: "admin",
  Visitor: "visitor",
} as const;

export type Role = (typeof UserRole)[keyof typeof UserRole];

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  hashedPassword: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column({ enum: UserRole, default: UserRole.Visitor })
  role: Role;

  @Field()
  @Column({ default: "https://media.istockphoto.com/id/1300845620/fr/vectoriel/appartement-dic%C3%B4ne-dutilisateur-isol%C3%A9-sur-le-fond-blanc-symbole-utilisateur.jpg?s=612x612&w=0&k=20&c=BVOfS7mmvy2lnfBPghkN__k8OMsg7Nlykpgjn0YOHj0=" })
  avatar: string
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
