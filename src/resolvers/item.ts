import {
  Arg,
  Field,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  Ctx,
  InputType,
} from "type-graphql";
import { getConnection } from "typeorm";
import { isAuth } from "../middleware/auth";
import { MyContext } from "../utils/types";
import { Item } from "../entities/Item";

@InputType()
class CreateItemInput {
  @Field()
  quantity: number;
  @Field()
  unit: string;
  @Field()
  expiryDate: Date;
}

@InputType()
class EditItemInput {
  @Field()
  id: number;
  @Field()
  quantity: number;
  @Field()
  unit: string;
  @Field()
  expiryDate: Date;
}

@Resolver()
export class ItemResolver {
  //get all items for current user
  @Query(() => [Item])
  @UseMiddleware(isAuth)
  async getItems(@Ctx() { payload }: MyContext): Promise<Item[]> {
    const userId = payload?.userId;
    if (!userId) return [];
    return Item.find({ where: { creatorId: userId } });
  }

  // create a new item
  @Mutation(() => Item)
  @UseMiddleware(isAuth)
  async createItem(
    @Arg("data") data: CreateItemInput,
    @Ctx() { payload }: MyContext
  ): Promise<Item> {
    const userId = payload?.userId;
    return Item.create({ ...data, creatorId: userId }).save();
  }

  //edit an item
  @Mutation(() => Item, { nullable: true })
  @UseMiddleware(isAuth)
  async updateItem(
    @Arg("data") data: EditItemInput,
    @Ctx() { payload }: MyContext
  ): Promise<Item | null> {
    const { id, quantity, unit, expiryDate } = data;
    const userId = payload?.userId;
    const result = await getConnection()
      .createQueryBuilder()
      .update(Item)
      .set({ quantity, unit, expiryDate })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: userId,
      })
      .returning("*")
      .execute();
    return result.raw[0];
  }

  //delete an item
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteItem(@Arg("id") id: number): Promise<boolean> {
    await Item.delete(id);
    return true;
  }
}
