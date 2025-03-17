"use server"

import OpenAI from 'openai';

const apiKey = process.env.NEBIUS_API_KEY;

if (!apiKey) {
  throw new Error('NEBIUS_API_KEY is not defined in environment variables');
}

// Initialize the OpenAI client only when the function is called
const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: apiKey,
});

type ImageSize = "1024x1024" | "1024x1792" | "1792x1024"

export async function generateImage(prompt: string, size: string) {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  try {
    const [width, height] = size.split('x').map(Number);

    const response = await client.images.generate({
      model: "black-forest-labs/flux-schnell",
      response_format: "b64_json",
      extra_body: {
        response_extension: "webp",
        width: width || 1024,
        height: height || 1024,
        num_inference_steps: 4,
        negative_prompt: "",
        seed: -1
      },
      prompt: prompt
    } as any);

    if (!response?.data?.[0]?.b64_json) {
      throw new Error('Failed to generate image: Invalid API response');
    }
    
    return { imageUrl: response.data[0].b64_json };
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a user-friendly error message in production
    throw new Error('Failed to generate image. Please try again later.');
  }
}

