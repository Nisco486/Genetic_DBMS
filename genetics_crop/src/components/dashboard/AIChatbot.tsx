import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cropApi } from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Namaste! I am Kisan Sahayak. How can I help you today? (Ask me in English, Hindi, or any regional language!)' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'I am sorry, I could not process that.' }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please ensure the backend is running.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-80 sm:w-96"
                    >
                        <Card className="shadow-2xl border-primary/20 overflow-hidden">
                            <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-white flex items-center gap-2 text-lg">
                                    <Bot className="w-5 h-5" />
                                    Kisan Sahayak
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <span title="Supports Indian Languages">
                                        <Languages className="w-4 h-4 text-white/70" />
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div
                                    ref={scrollRef}
                                    className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/30"
                                >
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                    ? 'bg-primary text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-zinc-800 border border-border rounded-tl-none shadow-sm'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-zinc-800 border border-border p-3 rounded-2xl rounded-tl-none shadow-sm">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t bg-white dark:bg-zinc-900 flex gap-2">
                                    <Input
                                        placeholder="Ask me anything..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        className="flex-1"
                                    />
                                    <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
                <MessageSquare className="w-7 h-7" />
            </motion.button>
        </div>
    );
}
