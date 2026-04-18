"use client"; 
 
 import { useState, useEffect, useRef } from "react"; 
 
 type Message = { 
   from: "bot" | "user"; 
   text: string; 
 }; 
 
 export default function ChatBot() { 
   const [messages, setMessages] = useState<Message[]>([ 
     { from: "bot", text: "👋 Hola, ¿qué turno querés sacar?" }, 
   ]); 
 
   const [input, setInput] = useState(""); 
   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
     if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
   }, [messages]);
 
   const sendMessage = (text: string) => { 
     if (!text.trim()) return; 
 
     const userMessage: Message = { from: "user", text };
     const newMessages: Message[] = [...messages, userMessage]; 
 
     let botResponse = ""; 
 
     if (text.toLowerCase().includes("corte")) { 
       botResponse = "✂️ Perfecto. ¿Qué día te gustaría?"; 
     } else if (text.toLowerCase().includes("mañana")) { 
       botResponse = "📅 Tengo disponible 10:00, 11:00 o 12:00. ¿Cuál elegís?"; 
     } else if (text.includes("10")) { 
       botResponse = "✅ Listo, te reservo a las 10:00. Confirmá por WhatsApp 👇"; 
     } else { 
       botResponse = "🤔 No entendí, ¿querés un corte?"; 
     } 
 
     setMessages([ 
       ...newMessages, 
       { from: "bot", text: botResponse }, 
     ]); 
 
     setInput(""); 
   }; 
 
   return ( 
     <div className="fixed bottom-6 right-6 w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300"> 
       
       <div className="p-3 bg-white text-black font-bold text-sm flex items-center justify-between"> 
         <span>Asistente BarberOS</span>
         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
       </div> 
 
       <div ref={scrollRef} className="flex-1 p-3 space-y-2 max-h-80 overflow-y-auto scrollbar-hide"> 
         {messages.map((msg, i) => ( 
           <div 
             key={i} 
             className={`text-sm px-3 py-2 rounded-lg max-w-[80%] break-words ${ 
               msg.from === "bot" 
                 ? "bg-white/10 text-white" 
                 : "bg-white text-black ml-auto shadow-sm" 
             }`} 
           > 
             {msg.text} 
           </div> 
         ))} 
       </div> 
 
       <div className="p-2 border-t border-white/10 flex gap-2 bg-black/50 backdrop-blur-sm"> 
         <input 
           value={input} 
           onChange={(e) => setInput(e.target.value)} 
           onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
           placeholder="Escribí..." 
           className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-white/20 transition-all" 
         /> 
         <button 
           onClick={() => sendMessage(input)} 
           className="bg-white text-black px-3 py-1 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors" 
         > 
           Enviar 
         </button> 
       </div> 
     </div> 
   ); 
 } 
