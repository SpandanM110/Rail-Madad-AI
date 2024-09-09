"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { Send, Trash } from "lucide-react";
import Image from "next/image";

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
    setLoading(true);
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: "user", parts: input },
      { role: "model", parts: "Processing your request..." },
    ]);
    setInput("");

    try {
      // Add general conversation responses
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        setHistory((oldHistory) => [
          ...oldHistory,
          { role: "model", parts: "Hello! How can I assist you today?" },
        ]);
        setLoading(false);
        return;
      }

      if (lowerInput.includes("hours") || lowerInput.includes("working hours")) {
        setHistory((oldHistory) => [
          ...oldHistory,
          { role: "model", parts: "Our support team is available 24/7 to assist you." },
        ]);
        setLoading(false);
        return;
      }

      if (lowerInput.includes("location") || lowerInput.includes("address")) {
        setHistory((oldHistory) => [
          ...oldHistory,
          { role: "model", parts: "Our office is located at 1234 Train Avenue, Transit City." },
        ]);
        setLoading(false);
        return;
      }

      if (complaintDetails.id) {
        // Handle case where details are provided
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
            ...oldHistory,
            { role: "model", parts: `Thank you for providing the details. ${summary}` },
          ]);
        } else {
          setHistory((oldHistory) => [
            ...oldHistory,
            { role: "model", parts: "Please provide the details in the format: Seat Number, Coach Number, Train Name, Your Name, Your Phone Number." },
          ]);
        }
      } else {
        // Handle new complaint
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
          ...oldHistory,
          { role: "model", parts: acknowledgment },
        ]);
      }
    } catch (error) {
      setHistory((oldHistory) => {
        const newHistory = oldHistory.slice(0, oldHistory.length - 1);
        newHistory.push({
          role: "model",
          parts: "Oops! Something went wrong. Please try again later or contact our support team directly.",
        });
        return newHistory;
      });
      setLoading(false);
      console.log(error);
      alert("Oops! Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
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
    <div className="relative flex px-2 justify-center max-w-3xl min-h-dvh w-full pt-6 bg-gray-900 rounded-t-3xl max-h-screen shadow shadow-slate-900">
      <div className="flex text-sm md:text-base flex-col pt-10 pb-16 w-full flex-grow flex-1 rounded-3xl shadow-md overflow-y-auto">
        {history.map((item, index) => (
          <div
            key={index}
            className={`chat ${
              item.role === "model" ? "chat-start" : "chat-end"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-6 md:w-10 rounded-full">
                <Image
                  alt="Avatar"
                  src={item.role === "model" ? "/geminis.jpeg" : "/user.jpg"}
                  width={50}
                  height={50}
                />
              </div>
            </div>
            <div className="chat-header mx-2 font-semibold opacity-80">
              {item.role === "model" ? "Rail Madad" : "You"}
            </div>
            <div
              className={`chat-bubble font-medium ${
                item.role === "model" ? "chat-bubble-primary" : ""
              }`}
            >
              <Markdown>{item.parts}</Markdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute px-2 bottom-2 w-full flex gap-1">
        <button
          className="btn btn-outline shadow-md btn-error rounded-3xl backdrop-blur"
          title="Reset"
          onClick={reset}
        >
          <Trash />
        </button>
        <textarea
          type="text"
          value={input}
          required
          rows={1}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your issue..."
          className="textarea backdrop-blur textarea-primary w-full rounded-3xl shadow-md border-2 border-gray-400 resize-none"
        />
        <button
          className="btn btn-primary btn-outline shadow-md rounded-3xl backdrop-blur"
          onClick={chatting}
          title="Send"
          disabled={loading}
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
