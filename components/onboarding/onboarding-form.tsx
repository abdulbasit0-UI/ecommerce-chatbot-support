"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProgressIndicator } from "./progress-indicator"
import { onboardingSchema, type OnboardingData } from "@/lib/validations/onboarding"
import { completeOnboarding } from "@/lib/actions/onboarding"
import { ChevronLeft, ChevronRight, Building2, Globe, Package, Users } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Business Information",
    description: "Tell us about your business",
    icon: Building2,
  },
  {
    id: 2,
    title: "Website & Products",
    description: "Share your online presence",
    icon: Globe,
  },
  {
    id: 3,
    title: "Product Scale",
    description: "How many products do you sell?",
    icon: Package,
  },
  {
    id: 4,
    title: "How did you find us?",
    description: "Help us understand our reach",
    icon: Users,
  },
]

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
  })

  const watchedValues = watch()

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })
      await completeOnboarding(formData)
    } catch (error) {
      console.error("Onboarding error:", error)
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return watchedValues.businessName && watchedValues.businessName.length >= 2
      case 2:
        return true // Website is optional
      case 3:
        return watchedValues.productCount
      case 4:
        return watchedValues.referralSource
      default:
        return false
    }
  }

  const currentStepData = steps[currentStep - 1]
  const Icon = currentStepData.icon

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to ChatBot Pro</h1>
          <p className="text-muted-foreground">Let's set up your account in just a few steps</p>
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Enter your business name"
                      {...register("businessName")}
                      className="mt-1"
                    />
                    {errors.businessName && (
                      <p className="text-destructive text-sm mt-1">{errors.businessName.message}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="website">Website URL (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      {...register("website")}
                      className="mt-1"
                    />
                    {errors.website && <p className="text-destructive text-sm mt-1">{errors.website.message}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <Label>How many products do you plan to sell? *</Label>
                  <RadioGroup
                    value={watchedValues.productCount}
                    onValueChange={(value) => setValue("productCount", value as any)}
                    className="grid grid-cols-2 gap-4"
                  >
                    {["1-10", "11-50", "51-100", "100+"].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option} products
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.productCount && <p className="text-destructive text-sm">{errors.productCount.message}</p>}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <Label>How did you hear about us? *</Label>
                  <RadioGroup
                    value={watchedValues.referralSource}
                    onValueChange={(value) => setValue("referralSource", value as any)}
                    className="space-y-3"
                  >
                    {["Google", "Social Media", "Friend", "Other"].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.referralSource && <p className="text-destructive text-sm">{errors.referralSource.message}</p>}
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep} disabled={!canProceed()} className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={!canProceed() || isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? "Setting up..." : "Complete Setup"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
