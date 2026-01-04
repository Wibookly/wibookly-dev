import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Mail, Sparkles, Copy, RefreshCw, Plus, Trash2, MessageSquare } from "lucide-react";

interface ThreadEmail {
  id: string;
  from: string;
  date: string;
  body: string;
}

interface Category {
  id: string;
  name: string;
  writing_style: string;
}

const WRITING_STYLES = [
  { value: "Professional & Polished", label: "Professional & Polished" },
  { value: "Friendly & Approachable", label: "Friendly & Approachable" },
  { value: "Concierge / White-Glove", label: "Concierge / White-Glove" },
  { value: "Direct & Efficient", label: "Direct & Efficient" },
  { value: "Empathetic & Supportive", label: "Empathetic & Supportive" },
];

const ACTIONS = [
  { value: "reply", label: "Reply to Email" },
  { value: "compose", label: "Compose New Email" },
  { value: "improve", label: "Improve Existing Draft" },
];

export default function EmailDraft() {
  const { user, loading: authLoading } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [writingStyle, setWritingStyle] = useState<string>("Professional & Polished");
  const [action, setAction] = useState<string>("reply");
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<ThreadEmail[]>([]);


  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data: profile } = await supabase.rpc("get_my_profile");
      if (!profile || profile.length === 0) return;

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, writing_style")
        .eq("organization_id", profile[0].organization_id)
        .eq("is_enabled", true)
        .order("sort_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setWritingStyle(category.writing_style);
    }
  };

  const handleGenerate = async () => {
    if (!emailSubject && action !== "compose") {
      toast.error("Please enter an email subject");
      return;
    }

    setIsGenerating(true);
    setGeneratedDraft("");

    try {
      const category = categories.find(c => c.id === selectedCategory);
      
      const { data, error } = await supabase.functions.invoke("draft-email", {
        body: {
          emailSubject,
          emailBody,
          senderName,
          senderEmail,
          categoryName: category?.name || "General",
          writingStyle,
          action,
          additionalContext,
          conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedDraft(data.draft);
      toast.success("Email draft generated!");
    } catch (error: any) {
      console.error("Error generating draft:", error);
      toast.error(error.message || "Failed to generate email draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    toast.success("Copied to clipboard!");
  };

  if (authLoading || loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">AI Email Drafting</h1>
          <p className="text-muted-foreground">
            Generate professional email drafts using AI with your preferred writing style
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Details
              </CardTitle>
              <CardDescription>
                Enter the email information to generate a draft
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Type */}
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Category (Optional)</Label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Writing Style */}
              <div className="space-y-2">
                <Label>Writing Style</Label>
                <Select value={writingStyle} onValueChange={setWritingStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WRITING_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sender Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sender Name</Label>
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sender Email</Label>
                  <Input
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Email Subject */}
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Re: Meeting Request"
                />
              </div>

              {/* Email Body */}
              <div className="space-y-2">
                <Label>
                  {action === "reply" ? "Original Email" : action === "improve" ? "Draft to Improve" : "Key Points"}
                </Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder={
                    action === "reply"
                      ? "Paste the email you want to reply to..."
                      : action === "improve"
                      ? "Paste your draft to improve..."
                      : "List the key points to include..."
                  }
                  rows={5}
                />
              </div>

              {/* Conversation History */}
              {action === "reply" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Thread History (Optional)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConversationHistory([
                        ...conversationHistory,
                        { id: crypto.randomUUID(), from: "", date: "", body: "" }
                      ])}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Email
                    </Button>
                  </div>
                  {conversationHistory.length > 0 && (
                    <div className="space-y-3">
                      {conversationHistory.map((email, index) => (
                        <div key={email.id} className="p-3 border rounded-lg bg-muted/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Email {index + 1} in thread
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConversationHistory(
                                conversationHistory.filter(e => e.id !== email.id)
                              )}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              placeholder="From (e.g., John <john@example.com>)"
                              value={email.from}
                              onChange={(e) => setConversationHistory(
                                conversationHistory.map(em => 
                                  em.id === email.id ? { ...em, from: e.target.value } : em
                                )
                              )}
                            />
                            <Input
                              placeholder="Date (e.g., Jan 3, 2025)"
                              value={email.date}
                              onChange={(e) => setConversationHistory(
                                conversationHistory.map(em => 
                                  em.id === email.id ? { ...em, date: e.target.value } : em
                                )
                              )}
                            />
                          </div>
                          <Textarea
                            placeholder="Email content..."
                            value={email.body}
                            onChange={(e) => setConversationHistory(
                              conversationHistory.map(em => 
                                em.id === email.id ? { ...em, body: e.target.value } : em
                              )
                            )}
                            rows={3}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {conversationHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add previous emails from this thread to help AI understand the conversation context.
                    </p>
                  )}
                </div>
              )}

              {/* Additional Context */}
              <div className="space-y-2">
                <Label>Additional Context (Optional)</Label>
                <Textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Any additional instructions or context..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generated Draft
                </span>
                {generatedDraft && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Your AI-generated email draft will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedDraft ? (
                <div className="rounded-lg border bg-muted/50 p-4 min-h-[300px] whitespace-pre-wrap">
                  {generatedDraft}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/30 p-8 min-h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Enter email details and click Generate to create a draft</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
