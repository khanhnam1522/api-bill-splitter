import { Item } from "../entities/Item";
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/auth";

@InputType()
class CreateItemInput implements Partial<Item> {
  @Field()
  name: string;

  @Field()
  creatorId: number;

  @Field()
  quantity: number;

  @Field({ nullable: true })
  expiringDate: Date;

  @Field()
  isLiquid: Boolean;
}

@Resolver()
export class ItemResolver {
  // get all items
  @Query(() => [Item])
  @UseMiddleware(isAuth)
  items(): Promise<Item[]> {
    return Item.find();
  }

  //get a single item by id
  @Query(() => Item, { nullable: true })
  @UseMiddleware(isAuth)
  item(@Arg("id") id: number): Promise<Item | undefined> {
    return Item.findOne(id);
  }

  // create a new item
  @Mutation(() => Item)
  @UseMiddleware(isAuth)
  async creatNewItem(@Arg("data") data: CreateItemInput): Promise<Item> {
    // 2 sql queries
    const { name, quantity, expiringDate, isLiquid, creatorId } = data;
    return await Item.create({
      name,
      quantity,
      expiringDate,
      isLiquid,
      creatorId,
    }).save();
  }

  // edit an item
  @Mutation(() => Item, { nullable: true })
  @UseMiddleware(isAuth)
  async editItem(
    @Arg("id") id: number,
    @Arg("name", () => String, { nullable: true }) name: string,
    @Arg("quantity", () => Int, { nullable: true }) quantity: number,
    @Arg("expiringDate", () => String, { nullable: true }) expiringDate: Date
  ): Promise<Item | null> {
    const item = await Item.findOne(id);
    if (!item) {
      return null;
    }

    await Item.update(
      { id },
      {
        name: name ? name : item.name,
        quantity: quantity ? quantity : item.quantity,
        expiringDate: expiringDate ? expiringDate : item.expiringDate,
      }
    );
    let newItem = await Item.findOne(id);
    return newItem ? newItem : null;
  }

  // delete an item
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteItem(@Arg("id") id: number): Promise<boolean> {
    await Item.delete(id);
    return true;
  }
}
