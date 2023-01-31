import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import {readFileSync} from 'fs';
import Handlebars from 'handlebars';
import {createTransport} from "nodemailer";
import path from 'path';

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
    try {
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
    } catch (e) {
        console.log(`❌ Unable to send sign-in email to user (${identifier})`);
    }
}

const sendWelcomeEmail = async ({ user }) => {
    const { email } = user;

    try {
        const emailFile = readFileSync(path.join(emailsDir, 'welcome.html'), {
            encoding: 'utf8',
        });
        const emailTemplate = Handlebars.compile(emailFile);
        await transporter.sendMail({
            from: `"✨ SupaVacation" ${process.env.EMAIL_FROM}`,
            to: email,
            subject: 'Welcome to SupaVacation! 🎉',
            html: emailTemplate({
                base_url: process.env.NEXTAUTH_URL,
                support_email: process.env.SUPPORT_EMAIL,
            }),
        });
    } catch (error) {
        console.log(`❌ Unable to send welcome email to user (${email})`);
    }
};

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
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    events: { createUser: sendWelcomeEmail },
});