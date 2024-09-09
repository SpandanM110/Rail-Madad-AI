"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { Send, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const categoryContactMap = {
  cleanliness: {
    category: "Cleanliness",
    contactNumber: "+1-800-111-2222",
  },
  staff: {
    category: "Staff Behavior",
    contactNumber: "+1-800-333-4444",
  },
  damage: {
    category: "Damage",
    contactNumber: "+1-800-555-6666",
  },
  food: {
    category: "Food Services",
    contactNumber: "+1-800-777-8888",
  },
};

function categorizeAndRoute(message) {
  let category = "General";
  let contactNumber = "+1-800-123-4567"; // Default contact number

  for (const [key, value] of Object.entries(categoryContactMap)) {
    if (message.toLowerCase().includes(key)) {
      category = value.category;
      contactNumber = value.contactNumber;
      break;
    }
  }

  return { category, contactNumber };
}

const ChatArea = () => {
  const router = useRouter();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "model",
      parts: "Hello! I'm Rail Madad, your train chatbot. How can I assist you today?",
    },
  ]);
  const [complaintDetails, setComplaintDetails] = useState({});
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_APIKEY);
  const [chat, setChat] = useState(null);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    if (!chat) {
      setChat(
        model.startChat({
          generationConfig: {
            maxOutputTokens: 400,
          },
        })
      );
    }
  }, [chat, model]);

  async function chatting() {
    if (!input.trim()) return;

    setLoading(true);
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: "user", parts: input },
      { role: "model", parts: "Processing your request..." },
    ]);
    setInput("");

    try {
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        setHistory((oldHistory) => [
          ...oldHistory.slice(0, -1),
          { role: "model", parts: "Hello! How can I assist you today?" },
        ]);
        return;
      }

      if (lowerInput.includes("hours") || lowerInput.includes("working hours")) {
        setHistory((oldHistory) => [
          ...oldHistory.slice(0, -1),
          { role: "model", parts: "Our support team is available 24/7 to assist you." },
        ]);
        return;
      }

      if (lowerInput.includes("location") || lowerInput.includes("address")) {
        setHistory((oldHistory) => [
          ...oldHistory.slice(0, -1),
          { role: "model", parts: "Our office is located at 1234 Train Avenue, Transit City." },
        ]);
        return;
      }

      if (complaintDetails.id) {
        handleComplaintDetails(input);
      } else {
        handleNewComplaint(input);
      }
    } catch (error) {
      handleError();
    } finally {
      setLoading(false);
    }
  }

  function handleComplaintDetails(input) {
    const details = input.split(",").map(detail => detail.trim());
    if (details.length === 5) {
      const [seat, coach, train, name, phone] = details;
      setComplaintDetails((prev) => ({
        ...prev,
        seatNumber: seat,
        coachNumber: coach,
        trainName: train,
        userName: name,
        userPhone: phone,
      }));

      const summary = `
        Your complaint details:
        - Complaint ID: ${complaintDetails.id}
        - Seat Number: ${seat}
        - Coach Number: ${coach}
        - Train Name: ${train}
        - Name: ${name}
        - Phone Number: ${phone}
        - Contact Number: ${complaintDetails.contactNumber}
      `;

      setHistory((oldHistory) => [
        ...oldHistory.slice(0, -1),
        { role: "model", parts: `Thank you for providing the details. ${summary}` },
      ]);
    } else {
      setHistory((oldHistory) => [
        ...oldHistory.slice(0, -1),
        { role: "model", parts: "Please provide the details in the format: Seat Number, Coach Number, Train Name, Your Name, Your Phone Number." },
      ]);
    }
  }

  function handleNewComplaint(input) {
    const { category, contactNumber } = categorizeAndRoute(input);
    const complaintID = Math.random().toString(36).substr(2, 9);

    setComplaintDetails({ id: complaintID, category, contactNumber });

    const acknowledgment = `
      Thank you for reaching out. Your complaint has been categorized as "${category}". 
      We have assigned a complaint ID: ${complaintID}. 
      To assist you better, could you please provide the following details?
      1. Seat Number
      2. Coach Number
      3. Train Name
      4. Your Name
      5. Your Phone Number
      
      This will help us link your issue with the complaint ID. 
      In the meantime, if you need immediate assistance, you can contact our ${category} support team at: ${contactNumber}. 
      Your satisfaction is important to us, and we're here to help!
    `;

    setHistory((oldHistory) => [
      ...oldHistory.slice(0, -1),
      { role: "model", parts: acknowledgment },
    ]);
  }

  function handleError() {
    setHistory((oldHistory) => [
      ...oldHistory.slice(0, -1),
      { role: "model", parts: "Oops! Something went wrong. Please try again later or contact our support team directly." },
    ]);
    console.log(error);
    alert("Oops! Something went wrong. Please try again later.");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatting();
    }
  }

  function reset() {
    setHistory([
      {
        role: "model",
        parts: "Hello! I'm Rail Madad, your train chatbot. How can I assist you today?",
      },
    ]);
    setInput("");
    setChat(null);
    setComplaintDetails({});
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow overflow-y-auto p-4">
        {history.map((item, index) => (
          <div
            key={index}
            className={`flex ${
              item.role === "model" ? "justify-start" : "justify-end"
            } mb-4`}
          >
            <div className={`flex ${item.role === "model" ? "flex-row" : "flex-row-reverse"} items-start max-w-[80%]`}>
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={item.role === "model" ? "/geminis.jpeg" : "/user.jpg"} alt="Avatar" />
                <AvatarFallback>{item.role === "model" ? "RM" : "U"}</AvatarFallback>
              </Avatar>
              <div className={`rounded-lg p-3 ${item.role === "model" ? "bg-blue-100" : "bg-green-100"}`}>
                <p className="text-sm font-semibold mb-1">{item.role === "model" ? "Rail Madad" : "You"}</p>
                <Markdown className="text-sm">{item.parts}</Markdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={reset} className="shrink-0">
            <Trash className="h-4 w-4" />
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your issue..."
            className="flex-grow"
            rows={1}
          />
          <Button onClick={chatting} disabled={loading} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;