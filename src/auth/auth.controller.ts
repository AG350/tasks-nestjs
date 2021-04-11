import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authServices: AuthService,
    ) {}

    @Post('/singup')
    singUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.authServices.singUp(authCredentialsDto)
    }
}
