"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ImageIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateImage } from "@/app/actions"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeProvider } from "@/components/theme-provider"

export const dynamic = 'force-dynamic';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [size, setSize] = useState("1024x1024")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await generateImage(prompt, size)
      if (!result?.imageUrl) {
        throw new Error(result?.message || 'Failed to generate image');
      }
      setImageUrl(`data:image/webp;base64,${result.imageUrl}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider>
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">AI Image Generator</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Describe the image you want to generate</Label>
                <Input
                  id="prompt"
                  placeholder="A futuristic city with flying cars and neon lights"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Image Size</Label>
                <Select value={size} onValueChange={setSize} disabled={loading}>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">1024×1024 (Square)</SelectItem>
                    <SelectItem value="1024x1792">1024×1792 (Portrait)</SelectItem>
                    <SelectItem value="1792x1024">1792×1024 (Landscape)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {imageUrl ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Generated Image</h2>
            <div className="relative h-[600px] w-full max-w-3xl mx-auto rounded-lg overflow-hidden border bg-muted">
              <Image
                src={imageUrl}
                alt={prompt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">Prompt: {prompt}</p>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your generated image will appear here</p>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}

