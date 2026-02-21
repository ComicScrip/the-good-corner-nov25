import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("verification")
export class BaVerification {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "identifier" })
  identifier!: string;

  @Column("text", { name: "value" })
  value!: string;

  @Column("timestamp", { name: "expiresAt" })
  expiresAt!: Date;

  @Column("timestamp", { name: "createdAt", nullable: true })
  createdAt: Date | null;

  @Column("timestamp", { name: "updatedAt", nullable: true })
  updatedAt: Date | null;
}
