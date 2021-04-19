import { Bill } from "../entities/Bill";
import {
  Arg,
  Ctx,
  Float,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/auth";

@Resolver()
export class BillResolver {
  //get all bills
  @Query(() => [Bill])
  @UseMiddleware(isAuth)
  bills(@Ctx() { em }: MyContext): Promise<Bill[]> {
    return em.find(Bill, {});
  }

  //get a single bill by id
  @Query(() => Bill, { nullable: true })
  @UseMiddleware(isAuth)
  bill(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Bill | null> {
    return em.findOne(Bill, { id });
  }

  //create a new bill
  @Mutation(() => Bill)
  @UseMiddleware(isAuth)
  async createBill(
    @Arg("total") total: number,
    @Ctx() { em }: MyContext
  ): Promise<Bill> {
    const bill = em.create(Bill, { total });
    await em.persistAndFlush(bill);
    return bill;
  }

  //edit a bill
  @Mutation(() => Bill, { nullable: true })
  @UseMiddleware(isAuth)
  async editBill(
    @Arg("id") id: number,
    @Arg("total", () => Float, { nullable: true }) total: number,
    @Ctx() { em }: MyContext
  ): Promise<Bill | null> {
    const bill = await em.findOne(Bill, { id });
    if (!bill) {
      return null;
    }
    if (total) {
      bill.total = total;
      await em.persistAndFlush(bill);
    }
    return bill;
  }

  //delete a bill
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteBill(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Bill, { id });
    } catch {
      return false;
    }
    return true;
  }
}
