import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/[A-Z]/, {
    message: 'Le mot de passe doit contenir au moins une majuscule',
  })
  @Matches(/[a-z]/, {
    message: 'Le mot de passe doit contenir au moins une minuscule',
  })
  @Matches(/[0-9]/, {
    message: 'Le mot de passe doit contenir au moins un chiffre',
  })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Le mot de passe doit contenir au moins un caractère spécial',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  fullName: string;
}