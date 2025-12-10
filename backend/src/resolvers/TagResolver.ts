import { Tag } from "../entities/Tag";
import {
    Query,
  Resolver,
} from "type-graphql";


@Resolver()
export default class TagResolver {
    @Query(() => [Tag])
    async tags(){
      return Tag.find()
        
    }
}