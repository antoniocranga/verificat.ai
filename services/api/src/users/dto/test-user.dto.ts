import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TestUserDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name!: string;
}
