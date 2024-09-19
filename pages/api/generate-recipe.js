import { OpenAI } from 'openai';
import { firestore } from '@/firebase'; // Ensure this points to your correct firebase config file
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        
        const snapshot = await getDocs(collection(firestore, 'pantry'));
        const pantryItems = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            pantryItems.push(`${doc.id}: ${data.quantity}`);
        });

        
        const itemsList = pantryItems.join(', ');
        const prompt = `Write a tasty recipe using the following pantry items: ${itemsList}. You do not need to use all items. Return only recipe.`;

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "You are recipe bot."},
                {"role": "user", "content": prompt},
            ],
        });

        console.log('API Response:', completion);
        res.status(200).json({ data: completion.choices[0].message.content });
    } catch (error) {
        console.error("Error generating recipe with OpenAI:", error);
        res.status(500).json({ error: 'Failed to generate recipe' });
    }
}
