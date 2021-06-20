import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class Item extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column() 
  name: string;

  @Field(() => Int)
  @Column({nullable: true})
  quantity: number;

  @Field(() => String)
  @Column({nullable: true})
  expiringDate: Date;

  @Field(() => Boolean)
  @Column()
  isLiquid: boolean;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
