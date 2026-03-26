import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, Mail, Clock, HelpCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

const DEFAULT_FAQS = [
  { question: "How long does it take to set up a store?", answer: "The typical timeline from onboarding to launch is 45-90 days, depending on your city, store area, and inventory requirements." },
  { question: "What is included in the franchise package?", answer: "The package includes store interior design, product inventory (imported from China), POS system, branding materials, launch marketing support, and ongoing operational guidance." },
  { question: "How do I track my shipment?", answer: "Go to the Orders page to see real-time tracking for all your inventory shipments — from factory to your doorstep." },
  { question: "What payment methods are accepted?", answer: "We accept bank transfers (NEFT/RTGS/IMPS), UPI, and credit/debit cards for all payments." },
  { question: "Who is my account manager?", answer: "Your account manager's contact details are shown on the Dashboard. You can also reach the EazyToSell team anytime via WhatsApp." },
  { question: "Can I reorder products after launch?", answer: "Yes! Once your store is live, you can place reorders directly through the catalog. Bulk reorder discounts are available." },
];

function FaqItem({ faq }: { faq: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-4 text-left hover:bg-accent/30 rounded-lg px-3 transition-colors"
        onClick={() => setOpen(!open)}
        data-testid={`button-faq-${faq.question.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="font-medium text-sm pr-4">{faq.question}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="pb-4 px-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function EtsPortalSupport() {
  const { data: faqData } = useQuery<{ faqs: { question: string; answer: string }[] }>({
    queryKey: ['/api/ets-portal/faqs'],
  });

  const faqs = faqData?.faqs || DEFAULT_FAQS;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-support">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-support-title">Support</h1>
        <p className="text-muted-foreground">Get help from the EazyToSell team or find answers in our FAQ.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <a href="https://wa.me/919306566900" target="_blank" rel="noopener noreferrer" className="block">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-green-200 dark:border-green-900">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <MessageCircle className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-3">Chat with us on WhatsApp for quick support.</p>
              <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-whatsapp">
                Open WhatsApp <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </a>

        <a href="tel:+919306566900" className="block">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Phone className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-3">Speak directly with your account manager.</p>
              <p className="text-lg font-bold" data-testid="text-support-phone">+91 93065 66900</p>
            </CardContent>
          </Card>
        </a>

        <a href="mailto:support@eazytosell.com" className="block">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Mail className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">Send us a detailed inquiry via email.</p>
              <p className="text-sm font-medium" data-testid="text-support-email">support@eazytosell.com</p>
            </CardContent>
          </Card>
        </a>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
          <CardDescription>Find quick answers to common questions about your store setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {faqs.map((faq, idx) => (
              <FaqItem key={idx} faq={faq} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Business Hours</p>
              <p className="text-sm">Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
              <p className="text-xs mt-1">WhatsApp messages are answered within 2 hours during business hours.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
