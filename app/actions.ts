"use server"

import OpenAI from 'openai';
import dotenv from "dotenv";
import { NextResponse } from 'next/server';
dotenv.config();

// Initialize the OpenAI client only when the function is called
// This ensures it's only created in the server environment
const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: process.env.NEBIUS_API_KEY,
});

type ImageSize = "1024x1024" | "1024x1792" | "1792x1024"

export async function generateImage(prompt: string, size: string) {
  try {
    const response = await client.images.generate({
      model: "black-forest-labs/flux-schnell",
      response_format: "b64_json",
      extra_body: {
        response_extension: "webp",
        width: 1024,
        height: 1024,
        num_inference_steps: 4,
        negative_prompt: "",
        seed: -1
      },
      prompt: prompt
    } as any);
    
    return { imageUrl: response.data[0].b64_json };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

