import { Bill } from "../entities/Bill";
import {
  Arg,
  Float,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/auth";

@Resolver()
export class BillResolver {
  //get all bills
  @Query(() => [Bill])
  @UseMiddleware(isAuth)
  bills(): Promise<Bill[]> {
    return Bill.find();
  }

  //get a single bill by id
  @Query(() => Bill, { nullable: true })
  @UseMiddleware(isAuth)
  bill(@Arg("id") id: number): Promise<Bill | undefined> {
    return Bill.findOne(id);
  }

  //create a new bill
  @Mutation(() => Bill)
  @UseMiddleware(isAuth)
  async createBill(
    @Arg("total") total: number  ): Promise<Bill> {
    // 2 sql queries
    return Bill.create({total}).save();
  }

  //edit a bill
  @Mutation(() => Bill, { nullable: true })
  @UseMiddleware(isAuth)
  async editBill(
    @Arg("id") id: number,
    @Arg("total", () => Float, { nullable: true }) total: number,
  ): Promise<Bill | null> {
    const bill = await Bill.findOne(id);
    if (!bill) {
      return null;
    }
    if (total) {
      await Bill.update({id}, {total})
    }
    return bill;
  }

  //delete a bill
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteBill(
    @Arg("id") id: number  
  ): Promise<boolean> {
    await Bill.delete(id)
    return true;
  }
}
