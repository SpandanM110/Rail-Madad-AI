"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, Trash } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const ImageVision = () => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "assistant", content: "Hello! I am Rail Madad. Upload an image and let me analyze the issue!" }
  ]);
  const [complaintId, setComplaintId] = useState(null);
  const [complaintDetails, setComplaintDetails] = useState({
    trainNumber: "",
    coachNumber: "",
    userName: "",
    userPhone: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_APIKEY);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  async function fileToGenerativePart(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          inlineData: {
            data: reader.result.split(",")[1],
            mimeType: file.type
          }
        });
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  }

  async function analyzeImage() {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      const imagePart = await fileToGenerativePart(await fetch(selectedImage).then(r => r.blob()));

      const result = await model.generateContent([
        "Analyze this image and describe any issues or problems you can see related to train travel or railway infrastructure. If there are no obvious issues, describe what you see in the image.",
        imagePart
      ]);

      const generatedComplaintId = Math.random().toString(36).substr(2, 9);
      setComplaintId(generatedComplaintId);

      setHistory(prev => [
        ...prev,
        { role: "user", content: "Image uploaded for analysis" },
        { role: "assistant", content: result.response.text() },
        { role: "assistant", content: `Your complaint has been assigned ID: ${generatedComplaintId}. Please provide additional details to complete the registration.` }
      ]);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setHistory(prev => [...prev, { role: "assistant", content: "An error occurred while analyzing the image. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    setComplaintDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (Object.values(complaintDetails).every(val => val)) {
      setHistory(prev => [
        ...prev,
        { role: "user", content: "Submitted complaint details" },
        { role: "assistant", content: `Thank you for providing the details. Your complaint (ID: ${complaintId}) has been submitted and will be reviewed shortly.` }
      ]);
      setComplaintId(null);
      setComplaintDetails({ trainNumber: "", coachNumber: "", userName: "", userPhone: "" });
      setSelectedImage(null);
    } else {
      alert("Please fill in all the required details.");
    }
  }

  function reset() {
    setHistory([{ role: "assistant", content: "Hello! I am Rail Madad. Upload an image and let me analyze the issue!" }]);
    setComplaintId(null);
    setComplaintDetails({ trainNumber: "", coachNumber: "", userName: "", userPhone: "" });
    setSelectedImage(null);
    setInput("");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow overflow-y-auto p-4">
        {history.map((message, index) => (
          <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"} mb-4`}>
            <div className={`flex ${message.role === "assistant" ? "flex-row" : "flex-row-reverse"} items-start max-w-[80%]`}>
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={message.role === "assistant" ? "/geminis.jpeg" : "/user.jpg"} alt="Avatar" />
                <AvatarFallback>{message.role === "assistant" ? "RM" : "U"}</AvatarFallback>
              </Avatar>
              <div className={`rounded-lg p-3 ${message.role === "assistant" ? "bg-blue-100" : "bg-green-100"}`}>
                <p className="text-sm font-semibold mb-1">{message.role === "assistant" ? "Rail Madad" : "You"}</p>
                <Markdown className="text-sm">{message.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <Card className="m-4">
          <CardContent className="p-4">
            <Image src={selectedImage} alt="Selected" width={300} height={200} className="rounded-lg" />
            <Button onClick={analyzeImage} className="mt-2 w-full">Analyze Image</Button>
          </CardContent>
        </Card>
      )}

      {complaintId && (
        <Card className="m-4">
          <CardContent className="p-4 grid gap-4">
            <Label htmlFor="trainNumber">Train Number</Label>
            <Input id="trainNumber" name="trainNumber" value={complaintDetails.trainNumber} onChange={handleInputChange} placeholder="Enter Train Number" />
            <Label htmlFor="coachNumber">Coach Number</Label>
            <Input id="coachNumber" name="coachNumber" value={complaintDetails.coachNumber} onChange={handleInputChange} placeholder="Enter Coach Number" />
            <Label htmlFor="userName">Your Name</Label>
            <Input id="userName" name="userName" value={complaintDetails.userName} onChange={handleInputChange} placeholder="Enter Your Name" />
            <Label htmlFor="userPhone">Your Phone Number</Label>
            <Input id="userPhone" name="userPhone" value={complaintDetails.userPhone} onChange={handleInputChange} placeholder="Enter Your Phone Number" />
            <Button onClick={handleSubmit}>Submit Details</Button>
          </CardContent>
        </Card>
      )}

      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={reset} className="shrink-0">
            <Trash className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <ImagePlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Image</DialogTitle>
              </DialogHeader>
              <Input type="file" onChange={handleImageUpload} accept="image/*" />
            </DialogContent>
          </Dialog>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow"
            rows={1}
          />
          <Button onClick={() => {
            if (input.trim()) {
              setHistory(prev => [...prev, { role: "user", content: input }, { role: "assistant", content: "I'm sorry, but I can only analyze images. Please upload an image for me to assist you." }]);
              setInput("");
            }
          }} disabled={loading} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageVision;