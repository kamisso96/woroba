import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    // Si l'email change, verifier qu'il n'est pas deja pris
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Cet email est deja utilise');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.fullName ? { fullName: dto.fullName } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit etre different',
      );
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Invalider tous les refresh tokens (l'utilisateur devra se reconnecter)
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { success: true };
  }

  async remove(userId: string) {
    // Prisma cascade sur User supprime : refresh tokens, shops, products, etc.
    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }
}
