// "use server"

// import OpenAI from 'openai';

// const apiKey:string | undefined = process.env.NEBIUS_API_KEY || "";

// if (!apiKey) {
//   throw new Error('NEBIUS_API_KEY is not defined in environment variables');
// }

// // Initialize the OpenAI client only when the function is called
// const client = new OpenAI({
//   baseURL: 'https://api.studio.nebius.com/v1/',
//   apiKey: apiKey,
// });

// type ImageSize = "1024x1024" | "1024x1792" | "1792x1024"

// export async function generateImage(prompt: string, size: string) {
//   if (!prompt) {
//     throw new Error('Prompt is required');
//   }

//   try {
//     const [width, height] = size.split('x').map(Number);

//     const response = await client.images.generate({
//       model: "black-forest-labs/flux-schnell",
//       response_format: "b64_json",
//       extra_body: {
//         response_extension: "webp",
//         width: width || 1024,
//         height: height || 1024,
//         num_inference_steps: 4,
//         negative_prompt: "",
//         seed: -1
//       },
//       prompt: prompt
//     } as any);

//     // if (!response?.data?.[0]?.b64_json) {
//     //   return { imageUrl: null };
//     // }
    
//     return { imageUrl: response.data[0].b64_json };
//   } catch (error) {
//     // console.error('Error generating image:', error);
//     // Return a user-friendly error message in production
//     return { imageUrl: null };
//   }
// }

"use server"

import OpenAI from 'openai';
import axios from 'axios';

const apiKey: string = process.env.NEBIUS_API_KEY || "";

// Initialize the OpenAI client
const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: apiKey,
});

type ImageSize = "1024x1024" | "1024x1792" | "1792x1024";
type ImageResponse = {
  imageUrl: string | null;
  message?: string;
  statusCode?: number;
};

export async function generateImage(prompt: string, size: string = "1024x1024"): Promise<ImageResponse> {
  // Return error instead of throwing
  if (!apiKey) {
    return { 
      imageUrl: null, 
      message: "API key configuration error", 
      statusCode: 500 
    };
  }

  if (!prompt) {
    return { 
      imageUrl: null, 
      message: "Prompt is required", 
      statusCode: 400 
    };
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
      return { 
        imageUrl: null, 
        message: "Failed to generate image: Invalid API response", 
        statusCode: 500 
      };
    }
    
    return { 
      imageUrl: response.data[0].b64_json,
      statusCode: 200
    };
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Handle errors properly with return instead of throw
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response && response.data) {
        const { message, statusCode } = response.data;
        return { imageUrl: null, message, statusCode };
      }
      if (error.code === "ECONNREFUSED") {
        return { 
          imageUrl: null, 
          message: "Connection refused. Please try again later or contact support.", 
          statusCode: 500 
        };
      }
    }
    
    // Default error response
    return { 
      imageUrl: null, 
      message: "Image generation failed. Please try again later.", 
      statusCode: 500 
    };
  }
}