import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token from frontend', example: 'eyJhbGciOiJSUzI1Ni...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class GoogleUserDto {
  email: string;
  name: string;
  picture: string;
  googleId: string;
}
