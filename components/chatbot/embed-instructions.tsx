"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Code, Globe, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface EmbedInstructionsProps {
  embedCode: string
  chatbotName: string
}

export function EmbedInstructions({ embedCode, chatbotName }: EmbedInstructionsProps) {
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  const embedScript = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/embed/${embedCode}.js"></script>`

  const handleCopy = (text: string, step: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Store</title>
</head>
<body>
    <h1>Welcome to My Store</h1>
    <p>Your website content here...</p>
    
    <!-- ChatBot Pro Widget -->
    ${embedScript}
</body>
</html>`

  const wordpressInstructions = `1. Log in to your WordPress admin dashboard
2. Go to Appearance > Theme Editor
3. Select your active theme
4. Open the footer.php file
5. Add the script before the closing </body> tag
6. Click "Update File"`

  const shopifyInstructions = `1. From your Shopify admin, go to Online Store > Themes
2. Click "Actions" > "Edit code" on your current theme
3. Open the "Layout" folder and click on theme.liquid
4. Scroll to the bottom and add the script before </body>
5. Click "Save"`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Embed Instructions
        </CardTitle>
        <CardDescription>Add {chatbotName} to your website with a simple script tag</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="script">Script Tag</TabsTrigger>
            <TabsTrigger value="html">HTML Example</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            <TabsTrigger value="shopify">Shopify</TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Copy this script tag:</h4>
              <div className="bg-muted p-4 rounded-lg relative">
                <code className="text-sm break-all">{embedScript}</code>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-transparent"
                  onClick={() => handleCopy(embedScript, "script")}
                >
                  {copiedStep === "script" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Installation Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Copy the script tag above</li>
                <li>Paste it into your website's HTML, just before the closing &lt;/body&gt; tag</li>
                <li>Save and publish your changes</li>
                <li>The chatbot will appear in the bottom-right corner of your website</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Complete HTML Example:</h4>
              <div className="bg-muted p-4 rounded-lg relative max-h-80 overflow-y-auto">
                <pre className="text-sm">
                  <code>{htmlExample}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-transparent"
                  onClick={() => handleCopy(htmlExample, "html")}
                >
                  {copiedStep === "html" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wordpress" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">WordPress Installation:</h4>
              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{wordpressInstructions}</pre>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Script to add:</h5>
                  <div className="bg-muted p-3 rounded relative">
                    <code className="text-sm break-all">{embedScript}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => handleCopy(embedScript, "wordpress")}
                    >
                      {copiedStep === "wordpress" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shopify" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Shopify Installation:</h4>
              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{shopifyInstructions}</pre>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Script to add:</h5>
                  <div className="bg-muted p-3 rounded relative">
                    <code className="text-sm break-all">{embedScript}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => handleCopy(embedScript, "shopify")}
                    >
                      {copiedStep === "shopify" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Testing Your Installation</h4>
              <p className="text-sm text-blue-800">
                After adding the script, visit your website and look for the chat widget in the bottom-right corner.
                Click it to test the chatbot functionality.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
