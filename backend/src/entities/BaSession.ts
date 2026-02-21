import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("session")
export class BaSession {
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
