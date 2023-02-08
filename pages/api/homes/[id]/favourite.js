import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const home = await prisma.home.update({
                where: {id},
                data: {
                    users: {
                        connect: {
                            id: user.id
                        }
                    }
                }
            })
            res.status(200).json(home);
        } catch (e) {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
    else if (req.method === 'DELETE') {
        try {
            const home = await prisma.home.update({
                where: {id},
                data: {
                    users: {
                        disconnect: [{ id: user.id }],
                    }
                }
            })
            res.status(200).json(home);
        } catch (e) {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
    // HTTP method not supported!
    else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res
            .status(405)
            .json({ message: `HTTP method ${req.method} is not supported.` });
    }
}