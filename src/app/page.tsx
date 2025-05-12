'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, User, SendHorizontal, Code, Eye, Info, Edit3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { enhanceGamePrompt, EnhanceGamePromptInput, EnhanceGamePromptOutput } from '@/ai/flows/enhance-game-prompt';
import { generateGameCode, GenerateGameCodeInput, GenerateGameCodeOutput } from '@/ai/flows/generate-game-code';
import { iterativelyImproveGame, IterativelyImproveGameInput, IterativelyImproveGameOutput } from '@/ai/flows/iteratively-improve-game';
import { parseCombinedCode, formatCodeForIteration, ParsedCode } from '@/lib/utils';
import { LoadingSpinner } from '@/components/icons';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
  status?: string; // e.g., "Enhancing prompt...", "Generating code..."
}

type CodeType = 'html' | 'css' | 'js';

export default function GameGeniusPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [currentAiStep, setCurrentAiStep] = useState('');

  const { toast } = useToast();
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { id: crypto.randomUUID(), sender: 'ai', text: "Welcome to GameGenius! Describe a game you'd like to create, and I'll help you build it." }
    ]);
  }, []);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTo({ top: chatScrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (sender: 'user' | 'ai', text: string, isLoading = false, status = '') => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), sender, text, isLoading, status }]);
  };

  const updateLastAiMessage = (text: string, isLoading = false, status = '') => {
    setMessages(prev => {
      const lastMsgIndex = prev.findLastIndex(m => m.sender === 'ai');
      if (lastMsgIndex !== -1) {
        const newMessages = [...prev];
        newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], text, isLoading, status };
        return newMessages;
      }
      return prev;
    });
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isAiProcessing) return;

    const userPrompt = userInput.trim();
    addMessage('user', userPrompt);
    setUserInput('');
    setIsAiProcessing(true);
    
    // Clear previous game state
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setGameDescription('');

    try {
      setCurrentAiStep('Enhancing your idea...');
      addMessage('ai', '', true, 'Enhancing your idea...');
      const enhancedPromptOutput: EnhanceGamePromptOutput = await enhanceGamePrompt({ originalPrompt: userPrompt });
      updateLastAiMessage(`Enhanced idea: ${enhancedPromptOutput.enhancedPrompt}`, true, 'Enhanced idea ready.');
      addMessage('ai', `Enhanced idea: ${enhancedPromptOutput.enhancedPrompt}`);

      setCurrentAiStep('Designing game rules & generating code...');
      updateLastAiMessage('', true, 'Designing game rules & generating code...');
      const gameCodeOutput: GenerateGameCodeOutput = await generateGameCode({ gameIdea: enhancedPromptOutput.enhancedPrompt });
      
      setHtmlCode(gameCodeOutput.htmlCode);
      setCssCode(gameCodeOutput.cssCode);
      setJsCode(gameCodeOutput.jsCode);
      setGameDescription(gameCodeOutput.gameDescription);
      
      updateLastAiMessage('Your game is ready! Check out the code and preview.', false, 'Game generated!');
      addMessage('ai', `Game Description: ${gameCodeOutput.gameDescription}`);

    } catch (error) {
      console.error('AI Error:', error);
      toast({ title: 'AI Error', description: 'Something went wrong while generating the game.', variant: 'destructive' });
      updateLastAiMessage('Sorry, I encountered an error. Please try again.', false, 'Error');
    } finally {
      setIsAiProcessing(false);
      setCurrentAiStep('');
    }
  };

  const handleImproveGame = async () => {
    if (!userInput.trim() || isAiProcessing) return;
    if (!htmlCode && !cssCode && !jsCode) {
      toast({ title: 'No Game to Improve', description: 'Please generate a game first before asking for improvements.', variant: 'destructive' });
      return;
    }

    const improvementRequest = userInput.trim();
    addMessage('user', improvementRequest);
    setUserInput('');
    setIsAiProcessing(true);

    try {
      setCurrentAiStep('Applying improvements...');
      addMessage('ai', '', true, 'Applying improvements...');
      
      const combinedCode = formatCodeForIteration(htmlCode, cssCode, jsCode);
      
      const improvedGameOutput: IterativelyImproveGameOutput = await iterativelyImproveGame({
        currentGameCode: combinedCode,
        userRequest: improvementRequest,
        gameDescription: gameDescription,
      });

      const parsed: ParsedCode = parseCombinedCode(improvedGameOutput.improvedGameCode);
      setHtmlCode(parsed.html);
      setCssCode(parsed.css);
      setJsCode(parsed.js);
      setGameDescription(improvedGameOutput.updatedGameDescription);

      updateLastAiMessage('Game updated with your improvements!', false, 'Improvements applied');
      addMessage('ai', `Review: ${improvedGameOutput.review}`);
      if (improvedGameOutput.updatedGameDescription !== gameDescription) {
        addMessage('ai', `Updated Game Description: ${improvedGameOutput.updatedGameDescription}`);
      }

    } catch (error) {
      console.error('AI Error during improvement:', error);
      toast({ title: 'AI Error', description: 'Something went wrong while improving the game.', variant: 'destructive' });
      updateLastAiMessage('Sorry, I encountered an error during improvement. Please try again.', false, 'Error');
    } finally {
      setIsAiProcessing(false);
      setCurrentAiStep('');
    }
  };
  
  const iframeSrcDoc = `
    <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
        <script>${jsCode}</script>
      </body>
    </html>
  `;

  const handleCodeChange = (type: CodeType, value: string) => {
    if (type === 'html') setHtmlCode(value);
    else if (type === 'css') setCssCode(value);
    else if (type === 'js') setJsCode(value);
  };
  
  const currentActionLabel = (!htmlCode && !cssCode && !jsCode) ? 'Generate Game' : 'Improve Game / New Idea';
  const currentActionFunction = (!htmlCode && !cssCode && !jsCode) ? handleSendMessage : handleImproveGame;


  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Left Panel: Chat */}
      <Card className="w-1/3 flex flex-col m-2 shadow-xl rounded-lg border-border">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="flex items-center text-xl font-semibold text-primary">
            <Bot className="mr-2 h-6 w-6" /> GameGenius Chat
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow p-4" ref={chatScrollAreaRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[80%] shadow ${msg.sender === 'user' ? 'bg-accent text-accent-foreground' : 'bg-card-foreground text-card'}`}>
                <div className="flex items-center mb-1">
                  {msg.sender === 'ai' ? <Bot className="h-5 w-5 mr-2 text-primary-foreground" /> : <User className="h-5 w-5 mr-2 text-primary" />}
                  <span className="font-semibold text-sm">{msg.sender === 'ai' ? 'GameGenius AI' : 'You'}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.isLoading && (
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <LoadingSpinner className="h-4 w-4 mr-1" />
                    <span>{msg.status || 'Processing...'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Describe your game idea or request changes..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isAiProcessing && currentActionFunction()}
              className="flex-grow bg-input text-foreground placeholder:text-muted-foreground focus:ring-accent"
              disabled={isAiProcessing}
            />
            <Button 
              onClick={currentActionFunction} 
              disabled={isAiProcessing || !userInput.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label={currentActionLabel}
            >
              {isAiProcessing ? <LoadingSpinner className="h-5 w-5" /> : <SendHorizontal className="h-5 w-5" />}
              <span className="ml-2 hidden md:inline">{currentActionLabel.split('/')[0].trim()}</span>
            </Button>
          </div>
          {isAiProcessing && currentAiStep && <p className="text-xs text-muted-foreground mt-1 text-center">{currentAiStep}</p>}
        </div>
      </Card>

      {/* Right Panel: Code Editor & Preview */}
      <div className="w-2/3 flex flex-col m-2 space-y-2">
        {/* Code Editor */}
        <Card className="flex-1 flex flex-col shadow-xl rounded-lg border-border overflow-hidden">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="flex items-center text-xl font-semibold text-primary">
              <Code className="mr-2 h-6 w-6" /> Code Editor
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Edit HTML, CSS, and JavaScript for your game.</CardDescription>
          </CardHeader>
          <Tabs defaultValue="html" className="flex-grow flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-2 bg-muted p-1 rounded-md">
              <TabsTrigger value="html" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm">HTML</TabsTrigger>
              <TabsTrigger value="css" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm">CSS</TabsTrigger>
              <TabsTrigger value="js" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm">JavaScript</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="flex-grow p-0 m-0 overflow-hidden">
              <Textarea
                value={htmlCode}
                onChange={(e) => handleCodeChange('html', e.target.value)}
                placeholder="HTML code will appear here..."
                className="h-full w-full resize-none border-0 rounded-none bg-secondary text-foreground font-mono text-sm p-2 focus-visible:ring-0"
              />
            </TabsContent>
            <TabsContent value="css" className="flex-grow p-0 m-0 overflow-hidden">
              <Textarea
                value={cssCode}
                onChange={(e) => handleCodeChange('css', e.target.value)}
                placeholder="CSS code will appear here..."
                className="h-full w-full resize-none border-0 rounded-none bg-secondary text-foreground font-mono text-sm p-2 focus-visible:ring-0"
              />
            </TabsContent>
            <TabsContent value="js" className="flex-grow p-0 m-0 overflow-hidden">
              <Textarea
                value={jsCode}
                onChange={(e) => handleCodeChange('js', e.target.value)}
                placeholder="JavaScript code will appear here..."
                className="h-full w-full resize-none border-0 rounded-none bg-secondary text-foreground font-mono text-sm p-2 focus-visible:ring-0"
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Game Preview */}
        <Card className="h-1/2 flex flex-col shadow-xl rounded-lg border-border overflow-hidden">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="flex items-center text-xl font-semibold text-primary">
              <Eye className="mr-2 h-6 w-6" /> Game Preview
            </CardTitle>
             <CardDescription className="text-xs text-muted-foreground">See your game in action!</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <iframe
              srcDoc={iframeSrcDoc}
              title="Game Preview"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
