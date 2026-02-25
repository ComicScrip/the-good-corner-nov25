import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

// Schema sentinel: TypeORM needs this entity in its metadata so it does NOT
// generate DROP TABLE "session" migrations. The session table is owned and
// written by better-auth's Kysely adapter — TypeORM never queries it directly.
@Entity("session")
export class BaSession extends BaseEntity {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "userId" })
  userId!: string;

  @Column("text", { name: "token", unique: true })
  token!: string;

  @Column("timestamp", { name: "expiresAt" })
  expiresAt!: Date;

  @Column("text", { name: "ipAddress", nullable: true })
  ipAddress: string | null;

  @Column("text", { name: "userAgent", nullable: true })
  userAgent: string | null;

  @Column("timestamp", { name: "createdAt" })
  createdAt!: Date;

  @Column("timestamp", { name: "updatedAt" })
  updatedAt!: Date;
}
