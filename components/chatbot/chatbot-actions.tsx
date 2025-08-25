"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Copy, Power, PowerOff, Trash2 } from "lucide-react"
import { deleteChatbot, toggleChatbotStatus } from "@/lib/actions/chatbot"
import { toast } from "sonner"

interface ChatbotActionsProps {
  chatbot: {
    id: string
    name: string
    isActive: boolean
    embedCode: string
  }
}

export function ChatbotActions({ chatbot }: ChatbotActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCopyEmbedCode = () => {
    const embedScript = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/embed/${chatbot.embedCode}.js"></script>`
    navigator.clipboard.writeText(embedScript)
    toast.success("Embed code copied to clipboard!")
  }

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      await toggleChatbotStatus(chatbot.id)
      toast.success(`Chatbot ${chatbot.isActive ? "deactivated" : "activated"} successfully`)
    } catch (error) {
      toast.error("Failed to update chatbot status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteChatbot(chatbot.id)
      toast.success("Chatbot deleted successfully")
    } catch (error) {
      toast.error("Failed to delete chatbot")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyEmbedCode}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Embed Code
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
            {chatbot.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chatbot.name}"? This action cannot be undone and will remove all
              associated conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
