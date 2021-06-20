import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class UserProfile extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column({ default: "username" })
  username: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  verificationCode: number;

  @Column({ nullable: true })
  verificationCodeUpdatedAt: Date;
}
