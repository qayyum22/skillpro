import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const userDoc = doc(firestore, 'users', userId as string);
        const userSnapshot = await getDoc(userDoc);

        if (!userSnapshot.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userSnapshot.data();
        return res.status(200).json({ role: userData.role });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user role' });
    }
}