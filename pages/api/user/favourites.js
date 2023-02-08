import {getSession} from "next-auth/react";
import {prisma} from "@/lib/prisma";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const session = await getSession({req});

            if (!session) {
                return res.status(401).json({message: 'Unauthorized.'});
            }

            const user = await prisma.user.findUnique({
                where: {email: session.user.email},
                include: {
                    favouriteHomes: true
                }
            });
            res.status(200).json(user.favouriteHomes);
        } catch (e) {
            res.status(500).json({ message: 'Something went wrong' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res
            .status(405)
            .json({ message: `HTTP method ${req.method} is not supported.` });
    }
}