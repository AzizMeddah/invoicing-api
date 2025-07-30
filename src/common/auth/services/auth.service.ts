import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseLoginDto } from '../dtos/login.response.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/services/user.service';
import { CreateUserDto } from 'src/modules/user/dtos/user.create.dto';
import { v4 as uuid } from 'uuid'; 
import { MailService } from 'src/common/mail/services/mail.service';
import { encryptPasswordWithSalt10 } from '../utils/encrypt-password';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) { }

  // Generate JWT Tokens
  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('app.jwtAccessTokenExpiration'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('app.jwtRefreshTokenExpiration'),
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(id: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(id, { refreshToken: hashedRefreshToken });
  }

  // Login User
  async login(
    usernameOrEmail: string,
    password: string,
  ): Promise<ResponseLoginDto> {
    const user = await this.userService.findOneByCondition({
      filter: `username||$eq||${usernameOrEmail}||$or||email||$eq||${usernameOrEmail}`,
    });
    if (!user) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Save the hashed refresh token in the database
    await this.saveRefreshToken(user.id, refreshToken);
    const userPermissions = await this.userService.getUserPermissions(user.id);


    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      permissions: userPermissions,
      requirePasswordChange: user.requirePasswordChange,
    };
  }

  // Register User
  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.save(createUserDto);
      return user;
    }
    catch (error) {
      if (error.message === 'users.errors.username_already_exist') {
        throw new BadRequestException('auth.errors.username_already_exist')
      }
      if (error.message === 'users.errors.email_already_exist') {
        throw new BadRequestException('auth.errors.email_already_exist')
      }
    }
  }

  // Refresh Token Logic
  async refreshToken(
    id: number,
    refreshToken: string,
  ): Promise<ResponseLoginDto> {
    const user = await this.userService.findOneById(id);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('auth.errors.invalid_refereshtoken');
    }

    // Validate refresh token
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('auth.errors.invalid_refereshtoken');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user);

    await this.saveRefreshToken(user.id, newRefreshToken);

    const userPermissions = await this.userService.getUserPermissions(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      permissions: userPermissions,
    };
  }
  

async forgotPassword(email: string): Promise<void> {
  const user = await this.userService.findOneByCondition({filter:`email||$eq||${email}`})

  if (!user) {
    return;
  }

  const resetToken = uuid();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15); // token expire dans 15 minutes
  user.resetToken = resetToken;
  user.resetTokenExpires = expires;
  await this.userService.update(user.id,user);
  await this.mailService.sendResetPasswordEmail(user.email, resetToken);
}
async resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await this.userService.findOneByCondition({
    filter: `resetToken||$eq||${token}`,
  });

  if (!user) {
    throw new BadRequestException('Token invalide ou expiré 1.');
  }

  const currentDate = new Date();

  if (!user.resetTokenExpires || currentDate > new Date(user.resetTokenExpires)) {
    throw new BadRequestException('Token invalide ou expiré 2.');
  }

  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpires = null;

  await this.userService.update(user.id, user);
}
  
}
