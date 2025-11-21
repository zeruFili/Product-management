import {   IsEmpty, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Category } from '../schemas/product.schema';
import { User } from '../../auth/schemas/user.schema';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  readonly name?: string;         

  @IsOptional()
  @IsString()
  readonly description?: string;  

  @IsOptional()
  @IsNumber()
  readonly price?: number;        

  @IsOptional()
  @IsNumber()
  readonly stock?: number;        

  @IsOptional()
  @IsEnum(Category, { message: 'Please enter the correct category.' })
  readonly category?: Category;    

  @IsEmpty({ message: 'You cannot pass user id' })
  readonly user: User;
}