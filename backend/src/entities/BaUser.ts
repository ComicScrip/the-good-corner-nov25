import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("ba_user")
export class BaUser {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "name" })
  name!: string;

  @Column("text", { name: "email", unique: true })
  email!: string;

  @Column("boolean", { name: "emailVerified" })
  emailVerified!: boolean;

  @Column("text", { name: "image", nullable: true })
  image: string | null;

  @Column("timestamp", { name: "createdAt" })
  createdAt!: Date;

  @Column("timestamp", { name: "updatedAt" })
  updatedAt!: Date;
}
