import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  async createVerification(email: string) {
    const recent = await this.prisma.emailVerification.findUnique({ where: { email } });
    if (recent && Date.now() - recent.updatedAt.getTime() < 60_000) {
      throw new HttpException("Please wait before requesting another code", HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.emailVerification.upsert({
      where: { email },
      update: {
        codeHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      create: {
        email,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    await this.send(email, "GalaxyPong verification code", `Your GalaxyPong code is ${code}`);
  }

  async consumeVerification(email: string, code: string) {
    const verification = await this.prisma.emailVerification.findUnique({ where: { email } });
    if (!verification || verification.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException("Verification code expired");
    }
    if (verification.attempts >= 5) {
      throw new HttpException("Too many verification attempts", HttpStatus.TOO_MANY_REQUESTS);
    }
    const valid = await bcrypt.compare(code.toUpperCase(), verification.codeHash);
    if (!valid) {
      await this.prisma.emailVerification.update({
        where: { email },
        data: { attempts: { increment: 1 } }
      });
      throw new BadRequestException("Invalid verification code");
    }
    await this.prisma.emailVerification.delete({ where: { email } });
  }

  private async send(to: string, subject: string, text: string) {
    if (process.env.EMAIL_MODE === "console") {
      console.info(`[email] ${to} | ${subject} | ${text}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.sendMail({
      to,
      subject,
      text,
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER
    });
  }
}
