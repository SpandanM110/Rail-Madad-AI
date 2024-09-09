"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus } from "lucide-react";
import Markdown from "react-markdown";

const ImageVision = () => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState(
    "Hello! I am Rail Madad. Upload an image and let me analyze the issue!"
  );
  const [complaintId, setComplaintId] = useState(null);
  const [trainNumber, setTrainNumber] = useState("");
  const [coachNumber, setCoachNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_APIKEY);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [text]);

  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const resultString = reader.result;
          resolve(resultString.split(",")[1]);
        } else {
          console.error("FileReader result is null");
        }
      };
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  async function run() {
    const fileInputEl = fileInputRef.current;
    setInput("");
    if (fileInputEl && fileInputEl.files.length > 0) {
      setLoading(true);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imageParts = await Promise.all(
          [...fileInputEl.files].map(fileToGenerativePart)
        );

        // Analyze images and get results
        const result = await model.generateContentStream([input, ...imageParts]);
        setLoading(false);
        let newText = "";
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          newText += chunkText;
          setText(newText);
        }

        // Generate complaint ID and request additional details
        const generatedComplaintId = "pubj7scr3"; // This should be generated dynamically
        setComplaintId(generatedComplaintId);
        setText(`Thank you for the image. Your complaint has been categorized and assigned a Complaint ID: ${generatedComplaintId}. Please provide the following details to complete the complaint registration:`);
        
      } catch (error) {
        console.error("Error generating content stream:", error);
        setLoading(false);
        setText("Oops, an error occurred while generating the response.");
      }
    } else {
      alert("Please select an image.");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      run();
    }
  }

  function handleSubmit() {
    if (complaintId && trainNumber && coachNumber && userName && userPhone) {
      // Submit the complaint details
      // You would typically send this data to your backend or API here
      console.log({
        complaintId,
        trainNumber,
        coachNumber,
        userName,
        userPhone
      });

      setText("Thank you for providing the details. Your complaint has been submitted and will be reviewed shortly.");
    } else {
      alert("Please fill in all the required details.");
    }
  }

  return (
    <div className="relative flex px-2 justify-center max-w-3xl min-h-dvh w-full pt-6 bg-gray-900 rounded-t-3xl max-h-screen shadow shadow-slate-900">
      <div className="flex text-sm md:text-base flex-col pt-10 pb-16 w-full flex-grow flex-1 rounded-3xl shadow-md overflow-y-auto">
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="w-6 md:w-10 rounded-full">
              <Image alt="Rail Madad" src="/geminis.jpeg" width={50} height={50} />
            </div>
          </div>
          <div className="chat-header mx-2 font-semibold opacity-80">Rail Madad</div>
          <div className="chat-bubble font-medium chat-bubble-primary">
            {loading ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              <Markdown>{text}</Markdown>
            )}
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>

      <div className="absolute px-2 bottom-2 w-full flex gap-1">
        <button
          className="btn btn-accent rounded-3xl shadow-md btn-outline backdrop-blur"
          onClick={() => document.getElementById("my_modal_1").showModal()}
        >
          <ImagePlus />
        </button>
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3">Select Image</h3>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="file-input w-full file-input-primary"
              placeholder="Image"
              title="Image"
            />
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Done</button>
              </form>
            </div>
          </div>
        </dialog>
        <textarea
          type="text"
          value={input}
          required
          rows={1}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start Chatting..."
          className="textarea backdrop-blur textarea-primary w-full mx-auto bg-opacity-60 font-medium shadow rounded-3xl"
        />
        <button
          className={`btn rounded-3xl shadow-md ${
            loading
              ? "btn-accent cursor-wait pointer-events-none"
              : "btn-primary"
          }`}
          title="Send"
          onClick={run}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Send />
          )}
        </button>
      </div>

      {complaintId && (
        <div className="absolute bottom-0 px-2 w-full bg-gray-800 rounded-t-3xl py-4">
          <div className="flex flex-col gap-2">
            <label className="text-white">Train Number</label>
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="Enter Train Number"
              className="input input-primary w-full"
            />
            <label className="text-white">Coach Number</label>
            <input
              type="text"
              value={coachNumber}
              onChange={(e) => setCoachNumber(e.target.value)}
              placeholder="Enter Coach Number"
              className="input input-primary w-full"
            />
            <label className="text-white">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter Your Name"
              className="input input-primary w-full"
            />
            <label className="text-white">Your Phone Number</label>
            <input
              type="text"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="Enter Your Phone Number"
              className="input input-primary w-full"
            />
            <button
              className="btn btn-accent rounded-3xl shadow-md w-full"
              onClick={handleSubmit}
            >
              Submit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageVision;
