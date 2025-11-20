import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Category } from '../schemas/product.schema';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;  // Updated from title to name

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsNumber()
  readonly stock: number;  // Added stock field

  @IsNotEmpty()
  @IsEnum(Category, { message: 'Please enter correct category.' })
  readonly category: Category;
}