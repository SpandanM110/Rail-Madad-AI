// pages/chat.jsx
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dynamically import components to avoid SSR issues with browser-only APIs
const ChatArea = dynamic(() => import('../components/ChatArea'), { ssr: false });
const ImageVision = dynamic(() => import('../components/ImageVision'), { ssr: false });

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Rail Madad Support</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text Chat</TabsTrigger>
          <TabsTrigger value="image">Image Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ChatArea />
        </TabsContent>
        <TabsContent value="image" className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ImageVision />
        </TabsContent>
      </Tabs>
    </div>
  );
}