import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Moon, RefreshCw, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { words } from "@/data/wordDatabase";
import { useTheme } from "@/components/theme-provider";

const availableSymbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const Index = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
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
      return useCapitals 
        ? word.charAt(0).toUpperCase() + word.slice(1) 
        : word;
    };

    const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];
    const getRandomNumber = () => Math.floor(Math.random() * 10).toString();

    const generateSinglePassword = () => {
      const usedWords = new Set<string>();
      let password = getRandomWord(usedWords) + getRandomNumber() + getRandomSymbol() + getRandomWord(usedWords);
      
      while (password.length < passwordLength) {
        const rand = Math.random();
        if (rand < 0.4) password += getRandomNumber();
        else if (rand < 0.7) password += getRandomSymbol();
        else {
          if (usedWords.size < words.length) {
            password += getRandomWord(usedWords);
          } else {
            password += Math.random() < 0.5 ? getRandomNumber() : getRandomSymbol();
          }
        }
      }

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
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Password Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Password Length: {passwordLength}</Label>
                <Slider
                  value={[passwordLength]}
                  onValueChange={(value) => setPasswordLength(value[0])}
                  min={16}
                  max={32}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="capitals"
                  checked={useCapitals}
                  onCheckedChange={setUseCapitals}
                />
                <Label htmlFor="capitals" className="text-foreground">Use Capital Letters</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excluded" className="text-foreground">Exclude Symbols</Label>
                <Input
                  id="excluded"
                  value={excludedSymbols}
                  onChange={(e) => setExcludedSymbols(e.target.value)}
                  placeholder="Enter symbols to exclude"
                  className="font-mono bg-background text-foreground"
                />
              </div>

              <Button 
                onClick={generatePassword}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Passwords
              </Button>
            </div>

            <div className="space-y-3">
              {passwords.map((password, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg font-mono group hover:bg-muted/80 transition-colors"
                >
                  <span className="break-all text-foreground">{password}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(password, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
};

export default Index;
