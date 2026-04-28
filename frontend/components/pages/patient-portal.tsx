'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, ArrowRight, Loader2, Send, Brain, FileText } from 'lucide-react';
import SpecialistModal from '@/components/specialist-modal';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const cleanAIResponse = (text: string) => {
  if (!text) return '';
  
  let result = text;
  result = result.replace(/<think>[\s\S]*?<\/think>/gi, '');

  const thoughtStartMatch = result.match(/<?\/?unused94>?thought/i);
  if (thoughtStartMatch && thoughtStartMatch.index !== undefined) {
    const startIndex = thoughtStartMatch.index;
    const searchString = result.substring(startIndex + thoughtStartMatch[0].length);
    const closingMatch = searchString.match(/<?\/?unused94>?/i);
    
    if (closingMatch && closingMatch.index !== undefined) {
      const endIndex = startIndex + thoughtStartMatch[0].length + closingMatch.index + closingMatch[0].length;
      result = result.substring(0, startIndex) + result.substring(endIndex);
    } else {
      // If no closing tag is found, check if the actual report started anyway (e.g., "**Findings:**")
      const possibleReportStart = searchString.search(/\n(?:#|\*)*\s*(?:Findings|Patient|Impressions|Report|Diagnosis)/i);
      if (possibleReportStart !== -1) {
         // The thought process probably ended where the report heading starts
         result = result.substring(0, startIndex) + searchString.substring(possibleReportStart);
      } else {
         const before = result.substring(0, startIndex).trim();
         if (before) {
            result = before;
         } else {
            return "The AI was still analyzing and reached its maximum text limit before it could finish your report. (The response only contained internal processing). Please try again or increase the backend token limit.";
         }
      }
    }
  }

  result = result.replace(/<?\/?unused94>?/gi, '').trim();
  
  if (!result) {
    return "The AI generated an internal analysis but failed to output a final response. Please try again.";
  }

  return result;
};

export default function PatientPortal() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const dragRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

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
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "x-api-key": process.env.NEXT_PUBLIC_OMNIMED_API_KEY || "your-default-secret-key" },
        body: formData,
      });
      if (!response.ok) throw new Error("Backend not responding");
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: cleanAIResponse(data.response) }]);
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection Error: Could not connect to the local OmniMed Engine. Please ensure your Python server (api.py) is running on port 8000." }]);
    } finally {
      setIsLoading(false);
    }
  };

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
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "x-api-key": process.env.NEXT_PUBLIC_OMNIMED_API_KEY || "your-default-secret-key" },
        body: formData,
      });
      if (!response.ok) throw new Error("Backend not responding");
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: cleanAIResponse(data.response) }]);
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection Error. Could not fetch response." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!uploadedFile) return;
    setIsGeneratingReport(true);
    
    const reportPrompt = "Based strictly on the image provided and our conversation history, generate a final, comprehensive medical report structured with Findings, Impressions, and Recommendations. Do NOT ask me for any missing patient information (Name, DOB, etc.). If you lack specific details, simply omit them or use generic placeholders like [Patient Name]. Your entire response must be the generated report itself and nothing else.";
    const newUserMsg: ChatMessage = { role: 'user', content: reportPrompt };
    const historyForReport = [...messages, newUserMsg];
    
    const formData = new FormData();
    formData.append("image", uploadedFile);
    formData.append("history", JSON.stringify(historyForReport));
    
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "x-api-key": process.env.NEXT_PUBLIC_OMNIMED_API_KEY || "your-default-secret-key" },
        body: formData,
      });
      if (!response.ok) throw new Error("Backend not responding");
      const data = await response.json();
      
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage([595.28, 841.89]);
      let { width, height } = page.getSize();
      
      let yPos = height - 50;
      
      page.drawText("OmniMed AI Medical Report", { x: 50, y: yPos, size: 22, font: boldFont, color: rgb(0.13, 0.13, 0.13) });
      
      yPos -= 20;
      page.drawText(`Generated on: ${new Date().toLocaleString()}`, { x: 50, y: yPos, size: 10, font: font, color: rgb(0.4, 0.4, 0.4) });
      
      yPos -= 15;
      page.drawText("CONFIDENTIAL - FOR MEDICAL PROFESSIONAL REVIEW ONLY", { x: 50, y: yPos, size: 10, font: font, color: rgb(0.4, 0.4, 0.4) });
      
      yPos -= 10;
      page.drawLine({ start: { x: 50, y: yPos }, end: { x: width - 50, y: yPos }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      
      yPos -= 30;
      
      const cleanText = cleanAIResponse(data.response).replace(/\*\*/g, '');
      const wrapText = (text: string, maxWidth: number, font: any, fontSize: number) => {
        const words = text.split(' ');
        let lines: string[] = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const textWidth = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
          if (textWidth < maxWidth) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      const paragraphs = cleanText.split('\n');
      for (const p of paragraphs) {
        if (!p.trim()) {
           yPos -= 15;
           continue;
        }
        const lines = wrapText(p, width - 100, font, 12);
        for (const line of lines) {
          if (yPos < 50) {
            page = pdfDoc.addPage([595.28, 841.89]);
            yPos = height - 50;
          }
          page.drawText(line, { x: 50, y: yPos, size: 12, font: font, color: rgb(0.15, 0.15, 0.15) });
          yPos -= 16;
        }
        yPos -= 10;
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `OmniMed_Medical_Report.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Connection Error:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <SpecialistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            OmniMed <span className="text-gradient">Patient Care</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your scan and chat instantly with your private AI second opinion.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 h-full">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6 animate-fade-in-up delay-100">
            <div
              ref={dragRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`glass-card flex cursor-pointer flex-col items-center justify-center p-10 transition-all duration-300 hover:shadow-glow-sm ${isDragActive ? 'border-primary shadow-glow-sm scale-[1.02]' : ''} ${uploadedFile ? 'border-primary/50' : ''}`}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl mb-4 transition-all ${uploadedFile ? 'bg-gradient-cta text-white shadow-glow-sm' : 'bg-muted text-muted-foreground'}`}>
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-center font-semibold text-foreground">{uploadedFile ? uploadedFile.name : 'Choose Scan File'}</p>
              <p className="mt-1 text-sm text-muted-foreground">X-Ray, MRI, or CT (JPG/PNG)</p>
            </div>

            <div className="glass-card p-6">
              <label className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">What are you feeling?</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe any pain or symptoms..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" rows={4} />
            </div>

            <button onClick={handleAnalyze} disabled={!uploadedFile || (isLoading && messages.length === 0)}
              className="w-full rounded-xl bg-gradient-cta py-4 text-lg font-bold text-white shadow-glow-sm transition-all hover:shadow-glow hover:scale-[1.01] disabled:opacity-40 disabled:shadow-none disabled:scale-100 flex justify-center items-center gap-2">
              {isLoading && messages.length === 0 ? (<><Loader2 className="animate-spin h-5 w-5" /> Analyzing...</>) : ('Start Diagnosis')}
            </button>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-8 flex flex-col animate-fade-in-up delay-200">
            {messages.length > 0 ? (
              <div className="flex flex-col min-h-[600px] h-full glass-card overflow-hidden">
                <div className="bg-gradient-cta px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">OmniMed AI Chat</h3>
                    <p className="text-xs text-white/60">Ask follow-up questions about your scan</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleGenerateReport} disabled={isGeneratingReport || isLoading} className="text-xs flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3.5 py-2 rounded-lg font-bold hover:bg-white/20 transition-all border border-white/20 disabled:opacity-50">
                      {isGeneratingReport ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />} Report
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="text-xs flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3.5 py-2 rounded-lg font-bold hover:bg-white/20 transition-all border border-white/20">
                      Contact Specialist <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
                  {messages.map((msg, idx) => {
                    if (idx === 0) return (
                      <div key={idx} className="flex flex-col items-center my-4">
                        <div className="glass px-4 py-3 rounded-lg text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
                          <Upload className="h-3 w-3" /> Scan & Symptoms Submitted
                        </div>
                      </div>
                    );
                    const isUser = msg.role === 'user';
                    return (
                      <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${isUser ? 'bg-gradient-cta text-white rounded-tr-sm shadow-glow-sm' : 'glass rounded-tl-sm'}`}>
                          {!isUser && <span className="font-black text-[10px] text-primary uppercase tracking-widest mb-2 flex items-center gap-1"><Brain className="h-3 w-3"/> OmniMed AI</span>}
                          <p className={`leading-relaxed whitespace-pre-wrap ${!isUser ? 'text-foreground' : ''}`}>{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && messages.length > 0 && (
                    <div className="flex flex-col items-start px-2">
                      <div className="glass p-3 rounded-2xl rounded-tl-sm"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-card/80 border-t border-border/50">
                  <div className="relative">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && chatInput.trim() && handleSendMessage()}
                      placeholder="Ask me anything about your results..."
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground/50"
                      disabled={isLoading} />
                    <button onClick={handleSendMessage} disabled={!chatInput.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-cta text-white rounded-lg hover:shadow-glow-sm disabled:opacity-30 transition-all">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[10px] text-muted-foreground/60">AI assessments do not replace professional medical judgment. Always consult a physician.</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center glass-card p-12 text-center min-h-[500px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4"><Brain className="h-8 w-8" /></div>
                <p className="text-sm font-medium text-muted-foreground">Your interactive AI analysis will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}