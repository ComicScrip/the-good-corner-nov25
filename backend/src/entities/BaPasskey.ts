import { BaseEntity, Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("passkey")
export class BaPasskey extends BaseEntity {
  @PrimaryColumn("text")
  id!: string;

  @Column("text", { name: "name", nullable: true })
  name: string | null;

  @Column("text", { name: "publicKey" })
  publicKey!: string;

  @Index()
  @Column("text", { name: "userId" })
  userId!: string;

  @Index()
  @Column("text", { name: "credentialID" })
  credentialID!: string;

  @Column("bigint", { name: "counter" })
  counter!: number;

  @Column("text", { name: "deviceType" })
  deviceType!: string;

  @Column("boolean", { name: "backedUp" })
  backedUp!: boolean;

  @Column("text", { name: "transports", nullable: true })
  transports: string | null;

  @Column("timestamp", { name: "createdAt", nullable: true })
  createdAt: Date | null;

  @Column("text", { name: "aaguid", nullable: true })
  aaguid: string | null;
}
