import { GraphQLError } from "graphql";
import { Arg, Authorized, Int, Mutation, Query, Resolver } from "type-graphql";
import {
  Category,
  NewCategoryInput,
  UpdateCategoryInput,
} from "../entities/Category";
import { UserRole } from "../entities/User";

@Resolver()
export default class CategoryResolver {
  @Query(() => [Category])
  async categories() {
    return Category.find();
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Category)
  async createCategory(
    @Arg("data", () => NewCategoryInput, { validate: true })
    data: NewCategoryInput,
  ) {
    const newCategory = new Category();
    Object.assign(newCategory, data);
    const { id } = await newCategory.save();
    return Category.findOne({
      where: { id },
      relations: { ads: true },
    });
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Category)
  async updateCategory(
    @Arg("id", () => Int) id: number,
    @Arg("data", () => UpdateCategoryInput, { validate: true })
    data: UpdateCategoryInput,
  ) {
    const categoryToUpdate = await Category.findOne({
      where: { id },
      relations: { ads: true },
    });
    if (!categoryToUpdate)
      throw new GraphQLError("category not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });

    Object.assign(categoryToUpdate, data);
    await categoryToUpdate.save();
    return categoryToUpdate;
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => String)
  async deleteCategory(@Arg("id", () => Int) id: number) {
    const category = await Category.findOne({
      where: { id },
      relations: { ads: true },
    });
    if (!category)
      throw new GraphQLError("category not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    await category.remove();
    return "category deleted !";
  }
}
