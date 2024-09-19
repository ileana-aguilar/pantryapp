

import { OpenAI } from 'openai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { downloadURL } = req.body;

    if (!downloadURL) {
        res.status(400).json({ error: 'Download URL is required' });
        return;
    }

    const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: `Create a JSON structure for all the food items and their quantities in the image. Quantity should be an integer. Return only JSON structure. Return in the following JSON format
                        {
                            "food_items": [
                                {
                                "name": str,
                                "quantity": str
                                }
                            ]
                        }` },
                        {
                            type: "image_url",
                            image_url: {
                                url: downloadURL,
                                detail: "low"  
                            },
                        },
                    ],
                },
            ],
        });

        
        console.log('API Response:', response);

        res.status(200).json({ data: response.choices[0].message.content });
    } catch (error) {
        console.error("Error processing image with OpenAI:", error);
        res.status(500).json({ error: 'Failed to process image' });
    }
}




