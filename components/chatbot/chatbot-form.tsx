"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { chatbotSchema, type ChatbotData } from "@/lib/validations/chatbot"
import { createChatbot, updateChatbot } from "@/lib/actions/chatbot"
import { Palette, MessageSquare, Bot } from "lucide-react"

interface ChatbotFormProps {
  chatbot?: {
    id: string
    name: string
    primaryColor: string
    welcomeMessage: string
  }
  isEditing?: boolean
}

const colorPresets = [
  "#8B4513", // Saddle Brown
  "#A0522D", // Sienna
  "#CD853F", // Peru
  "#D2691E", // Chocolate
  "#B8860B", // Dark Goldenrod
  "#DAA520", // Goldenrod
]

export function ChatbotForm({ chatbot, isEditing = false }: ChatbotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedColor, setSelectedColor] = useState(chatbot?.primaryColor || "#8B4513")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChatbotData>({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      name: chatbot?.name || "",
      primaryColor: chatbot?.primaryColor || "#8B4513",
      welcomeMessage: chatbot?.welcomeMessage || "Hello! How can I help you today?",
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: ChatbotData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      if (isEditing && chatbot) {
        await updateChatbot(chatbot.id, formData)
      } else {
        await createChatbot(formData)
      }
    } catch (error) {
      console.error("Chatbot form error:", error)
      setIsSubmitting(false)
    }
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setValue("primaryColor", color)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {isEditing ? "Edit Chatbot" : "Create New Chatbot"}
            </CardTitle>
            <CardDescription>
              {isEditing ? "Update your chatbot settings" : "Configure your chatbot's appearance and behavior"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Chatbot Name *</Label>
                <Input id="name" placeholder="e.g., Customer Support Bot" {...register("name")} />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Primary Color *
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        selectedColor === color ? "border-foreground scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    placeholder="#8B4513"
                    value={selectedColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    {...register("primaryColor")}
                    className="flex-1"
                  />
                </div>
                {errors.primaryColor && <p className="text-destructive text-sm">{errors.primaryColor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Welcome Message *
                </Label>
                <Textarea
                  id="welcomeMessage"
                  placeholder="Hello! How can I help you today?"
                  rows={3}
                  {...register("welcomeMessage")}
                />
                {errors.welcomeMessage && <p className="text-destructive text-sm">{errors.welcomeMessage.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Chatbot"
                    : "Create Chatbot"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your chatbot will look to visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Mock website background */}
              <div className="bg-muted rounded-lg p-4 min-h-[300px] relative">
                <div className="text-sm text-muted-foreground mb-4">Your Website</div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
                </div>

                {/* Chatbot widget */}
                <div className="absolute bottom-4 right-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>

                {/* Chat window preview */}
                <div className="absolute bottom-20 right-4 w-80 bg-background border rounded-lg shadow-xl">
                  <div className="p-4 text-white rounded-t-lg" style={{ backgroundColor: selectedColor }}>
                    <h3 className="font-semibold">{watchedValues.name || "Your Chatbot"}</h3>
                    <p className="text-sm opacity-90">Online now</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: selectedColor }}
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 max-w-xs">
                        <p className="text-sm">{watchedValues.welcomeMessage || "Hello! How can I help you today?"}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Hi, I need help with my order</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Type your message..." className="flex-1" />
                      <Button size="sm" style={{ backgroundColor: selectedColor }}>
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
