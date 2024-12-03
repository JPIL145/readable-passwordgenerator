import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { words } from "@/data/wordDatabase";

// Symbols that look similar are excluded by default
const availableSymbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const Index = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState<string[]>([]);
  const [passwordLength, setPasswordLength] = useState<number>(16);
  const [useCapitals, setUseCapitals] = useState(true);
  const [excludedSymbols, setExcludedSymbols] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generatePassword = () => {
    const symbols = availableSymbols
      .split("")
      .filter(symbol => !excludedSymbols.includes(symbol))
      .join("");

    const getRandomWord = (usedWords: Set<string>) => {
      let word;
      do {
        word = words[Math.floor(Math.random() * words.length)];
      } while (usedWords.has(word));
      
      usedWords.add(word);
      // If useCapitals is true, always capitalize the word
      return useCapitals 
        ? word.charAt(0).toUpperCase() + word.slice(1) 
        : word;
    };

    const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];
    const getRandomNumber = () => Math.floor(Math.random() * 10).toString();

    const generateSinglePassword = () => {
      const usedWords = new Set<string>();
      let password = getRandomWord(usedWords) + getRandomNumber() + getRandomSymbol() + getRandomWord(usedWords);
      
      // Add random characters until we reach desired length
      while (password.length < passwordLength) {
        const rand = Math.random();
        if (rand < 0.4) password += getRandomNumber();
        else if (rand < 0.7) password += getRandomSymbol();
        else {
          if (usedWords.size < words.length) {
            password += getRandomWord(usedWords);
          } else {
            // If we've used all words, fall back to numbers and symbols
            password += Math.random() < 0.5 ? getRandomNumber() : getRandomSymbol();
          }
        }
      }

      // Trim to exact length if exceeded
      return password.slice(0, passwordLength);
    };

    const newPasswords = Array(5).fill(null).map(() => generateSinglePassword());
    setPasswords(newPasswords);
  };

  const copyToClipboard = async (password: string, index: number) => {
    await navigator.clipboard.writeText(password);
    setCopiedIndex(index);
    toast({
      title: "Password copied!",
      description: "The password has been copied to your clipboard.",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Password Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Password Length: {passwordLength}</Label>
              <Slider
                value={[passwordLength]}
                onValueChange={(value) => setPasswordLength(value[0])}
                min={16}
                max={32}
                step={1}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="capitals"
                checked={useCapitals}
                onCheckedChange={setUseCapitals}
              />
              <Label htmlFor="capitals">Use Capital Letters</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excluded">Exclude Symbols</Label>
              <Input
                id="excluded"
                value={excludedSymbols}
                onChange={(e) => setExcludedSymbols(e.target.value)}
                placeholder="Enter symbols to exclude"
                className="font-mono"
              />
            </div>

            <Button 
              onClick={generatePassword}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Passwords
            </Button>
          </div>

          <div className="space-y-2">
            {passwords.map((password, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg font-mono"
              >
                <span className="break-all">{password}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(password, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;