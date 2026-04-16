'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, ArrowRight, Loader2, Send, Brain } from 'lucide-react';
import SpecialistModal from '@/components/specialist-modal';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function PatientPortal() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const dragRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) setUploadedFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
  };

  // Initial Scan Analysis
  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setMessages([]);

    const fullPrompt = `Act as a helpful medical AI. The patient reports these symptoms: "${symptoms || 'None reported'}". Analyze this scan and provide a clear, patient-friendly explanation of the findings.`;
    
    const initialMessage: ChatMessage = { role: 'user', content: fullPrompt };
    const history = [initialMessage];
    
    setMessages(history);

    const formData = new FormData();
    formData.append("image", uploadedFile);
    formData.append("history", JSON.stringify(history));

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_OMNIMED_API_KEY || "your-default-secret-key"
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Backend not responding");

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection Error: Could not connect to the local OmniMed Engine. Please ensure your Python server (api.py) is running on port 8000." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Follow up chat
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !uploadedFile) return;

    const newUserMsg: ChatMessage = { role: 'user', content: chatInput };
    const newHistory = [...messages, newUserMsg];
    
    setMessages(newHistory);
    setChatInput('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", uploadedFile);
    formData.append("history", JSON.stringify(newHistory));

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_OMNIMED_API_KEY || "your-default-secret-key"
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Backend not responding");

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection Error. Could not fetch response." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white">
      <SpecialistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">OmniMed <span className="text-blue-600">Patient Care</span></h1>
          <p className="mt-4 text-lg text-gray-500">
            Upload your scan and chat instantly with your private AI second opinion.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 h-full">
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-6">
            <div
              ref={dragRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all bg-gray-50 hover:border-blue-400 ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } ${uploadedFile ? 'border-blue-600 bg-blue-50/30' : ''}`}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              <Upload className={`h-10 w-10 mb-4 ${uploadedFile ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="text-center font-bold text-gray-900">
                {uploadedFile ? uploadedFile.name : 'Choose Scan File'}
              </p>
              <p className="mt-1 text-sm text-gray-500">X-Ray, MRI, or CT (JPG/PNG)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                What are you feeling?
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe any pain or symptoms..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                rows={4}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!uploadedFile || (isLoading && messages.length === 0)}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-200 transition-all flex justify-center items-center gap-2"
            >
              {isLoading && messages.length === 0 ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Analyzing...</>
              ) : (
                'Start Diagnosis'
              )}
            </button>
          </div>

          {/* Chat Window Section */}
          <div className="lg:col-span-8 flex flex-col">
            {messages.length > 0 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col min-h-[600px] h-full rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 overflow-hidden">
                {/* Header */}
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">OmniMed AI Chat</h3>
                    <p className="text-xs text-gray-500">Ask follow-up questions about your scan</p>
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="text-xs flex items-center gap-1 bg-gray-900 text-white px-3 py-2 rounded-lg font-bold hover:bg-black transition-all">
                    Contact Specialist <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                  {messages.map((msg, idx) => {
                    // System/Initial Prompt Formatting
                    if (idx === 0) {
                      return (
                        <div key={idx} className="flex flex-col items-center my-4">
                           <div className="bg-white px-4 py-3 rounded-lg text-xs text-gray-500 border border-gray-200 uppercase tracking-widest font-semibold flex items-center gap-2">
                             <Upload className="h-3 w-3" /> Scan & Symptoms Submitted
                           </div>
                        </div>
                      );
                    }
                    
                    const isUser = msg.role === 'user';
                    return (
                      <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm max-w-[85%] ${
                          isUser 
                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                        }`}>
                          {!isUser && <span className="font-black text-[10px] text-blue-500 uppercase tracking-widest block mb-2 flex items-center gap-1"><Brain className="h-3 w-3"/> OmniMed AI</span>}
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isLoading && messages.length > 0 && (
                     <div className="flex flex-col items-start px-2">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm border-t-0">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        </div>
                     </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="relative">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && chatInput.trim() && handleSendMessage()}
                      placeholder="Ask me anything about your results..."
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-gray-50"
                      disabled={isLoading}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:opacity-50 transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-[10px] text-gray-400">AI assessments do not replace professional medical judgment. Always consult a physician.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50 p-12 text-center text-gray-400 min-h-[500px]">
                <Brain className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-sm font-medium">Your interactive AI analysis will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}