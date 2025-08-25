"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteAccountSchema, type DeleteAccountData } from "@/lib/validations/settings"
import { deleteAccount } from "@/lib/actions/settings"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

export function DangerZone() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteAccountData>({
    resolver: zodResolver(deleteAccountSchema),
  })

  const onSubmit = async (data: DeleteAccountData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      await deleteAccount(formData)
      // User will be redirected after successful deletion
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowDeleteDialog(false)
    reset()
  }

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="font-semibold text-destructive mb-2">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone and will:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Delete all your chatbots and configurations</li>
              <li>• Remove all conversation history</li>
              <li>• Cancel any active subscriptions</li>
              <li>• Permanently delete your profile</li>
            </ul>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input id="confirmText" placeholder="DELETE" {...register("confirmText")} />
              {errors.confirmText && <p className="text-destructive text-sm">{errors.confirmText.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Enter your password to confirm</Label>
              <Input id="password" type="password" placeholder="Your password" {...register("password")} />
              {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
            </div>

            <AlertDialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? "Deleting..." : "Delete Account"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
