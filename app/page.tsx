"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send, FileText, Sparkles, ArrowRight, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Base URL for the API
const API_BASE_URL = "http://localhost:8000"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isProcessed, setIsProcessed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        setError(null)
      } else {
        setError("Oops! I can only read PDF files, babes!")
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Oops! I can only read PDF files, babes!")
      }
    }
  }

  const handleProcessPdf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/api/scrape`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to process PDF")
      }

      await response.json()

      // Initialize the chat with a welcome message
      setMessages([
        {
          role: "assistant",
          content: `Hey babes! I just read that PDF for you! Ask me anything about it and I'll break it down for you. No boring details, just the tea you need to know! ✨`,
        },
      ])

      setIsProcessed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error processing PDF:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !isProcessed) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsChatLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ message: userMessage }),
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to get response")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error sending message:", err)
    } finally {
      setIsChatLoading(false)
    }
  }

  const resetApp = () => {
    setIsProcessed(false)
    setMessages([])
    setFile(null)
    setError(null)
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
            Ask Me Girl
          </h1>
          <p className="text-center text-gray-600 mt-2">Your sassy smart bestie to help you learn</p>
        </div>

        {!isProcessed ? (
          // Step 1: PDF Upload (only shown before processing)
          <Card className="mb-6 border-pink-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg">
              <CardTitle className="text-pink-500">Hey babes! What are we reading today?</CardTitle>
              <CardDescription>
                Drop your PDF below and I'll read it for you. No need to read the boring stuff - I got you! 💅
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleProcessPdf}>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors",
                    isDragging ? "border-pink-500 bg-pink-50" : "border-pink-200",
                    file ? "bg-purple-50" : "",
                  )}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  {!file ? (
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-pink-400 mb-2" />
                      <p className="text-pink-500 font-medium mb-2">Drag & drop your PDF here</p>
                      <p className="text-gray-500 text-sm mb-4">or</p>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-2 px-4 rounded-md">
                          Choose a PDF
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-3 rounded-md border border-pink-200">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-pink-500 mr-3" />
                        <div className="text-left">
                          <p className="font-medium text-pink-500 truncate max-w-[250px] md:max-w-[450px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={removeFile} className="text-gray-500 hover:text-pink-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing || !file}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reading PDF...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Let's Go!
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 bg-red-100 text-red-600 p-3 rounded-lg w-full border border-red-200">{error}</div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Step 2: Chat Interface (only shown after processing)
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-pink-600 font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Reading: {file?.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetApp}
                className="text-pink-600 border-pink-200 hover:bg-pink-50"
              >
                Read something else
              </Button>
            </div>

            <Card className="mb-6 border-pink-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg">
                <CardTitle className="text-pink-500">Let's chat, bestie!</CardTitle>
                <CardDescription>Ask me anything about that PDF</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-4 h-[400px] overflow-y-auto p-4 border rounded-md border-pink-100">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg max-w-[80%]",
                        message.role === "user"
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ml-auto"
                          : "bg-gradient-to-r from-purple-100 to-pink-100 border border-pink-200",
                      )}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg max-w-[80%] border border-pink-200">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                        <span className="text-pink-500">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ask me anything about this PDF..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isChatLoading}
                    className="flex-1 border-pink-200 focus-visible:ring-pink-400"
                  />
                  <Button
                    type="submit"
                    disabled={isChatLoading || !input.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-sm text-pink-600 bg-gradient-to-r from-pink-50 to-purple-50 rounded-b-lg">
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
