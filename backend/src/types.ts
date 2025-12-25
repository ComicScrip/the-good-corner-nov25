import type { FastifyReply, FastifyRequest } from "fastify";
import { Field, InputType, Int } from "type-graphql";
import type { User } from "./entities/User";

@InputType()
export class ObjectId {
  @Field(() => Int)
  id: number;
}

export interface GraphQLContext {
  user: User | null;
  res: FastifyReply;
  req: FastifyRequest;
}
