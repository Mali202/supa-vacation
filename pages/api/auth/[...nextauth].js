import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import {PrismaClient} from '@prisma/client';
import {readFileSync} from 'fs';
import Handlebars from 'handlebars';
import {createTransport} from "nodemailer";
import path from 'path';

const prisma = new PrismaClient();


const transporter = createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: process.env.NODE_ENV !== "development",
});

const emailsDir = path.resolve(process.cwd(), 'emails');
const sendVerificationRequest = ({identifier, url}) => {
    const emailFile = readFileSync(path.join(emailsDir, 'confirm-email.html'), {
        encoding: 'utf8',
    });
    const emailTemplate = Handlebars.compile(emailFile);
    transporter.sendMail({
        from: `"✨ SupaVacation" ${process.env.EMAIL_FROM}`,
        to: identifier,
        subject: 'Your sign-in link for SupaVacation',
        html: emailTemplate({
            base_url: process.env.NEXTAUTH_URL,
            signin_url: url,
            email: identifier,
        }),
    });
}

export default NextAuth({
    pages: {
        signIn: '/',
        signOut: '/',
        error: '/',
        verifyRequest: '/',
    },
    providers: [
        EmailProvider({
            maxAge: 10 * 60, // Magic links are valid for 10 min only
            sendVerificationRequest,
        }),
    ],
    adapter: PrismaAdapter(prisma),
});