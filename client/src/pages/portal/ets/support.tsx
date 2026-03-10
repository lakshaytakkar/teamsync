import { Phone, MessageCircle, Mail, Clock, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageShell, SectionCard } from "@/components/layout";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";

const CONTACT_CHANNELS = [
  {
    id: "call",
    title: "Call Us",
    description: "Speak directly with your account manager",
    detail: "+91 98765 43210",
    icon: Phone,
    action: "Call Now",
    href: "tel:+919876543210",
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Quick chat support on WhatsApp",
    detail: "+91 98765 43210",
    icon: MessageCircle,
    action: "Open WhatsApp",
    href: "https://wa.me/919876543210",
  },
  {
    id: "email",
    title: "Email",
    description: "Send us a detailed query via email",
    detail: "support@eazytosell.com",
    icon: Mail,
    action: "Send Email",
    href: "mailto:support@eazytosell.com",
  },
];

const SUPPORT_HOURS = [
  { day: "Monday - Friday", hours: "9:00 AM - 7:00 PM IST" },
  { day: "Saturday", hours: "10:00 AM - 4:00 PM IST" },
  { day: "Sunday", hours: "Closed" },
];

const FAQ_ITEMS = [
  {
    question: "How long does it take to launch my store?",
    answer:
      "The typical timeline from token payment to store launch is 60-90 days. This includes store design approval, inventory sourcing from China, shipping, customs clearance, and final setup. Your account manager will keep you updated at every stage.",
  },
  {
    question: "What is included in my franchise package?",
    answer:
      "Your package includes complete store interior design, product inventory, branding materials, POS system setup, staff training, marketing launch kit, and 6 months of dedicated account management support. The exact items depend on your selected package tier (Standard, Premium, or Enterprise).",
  },
  {
    question: "How do I track my shipment?",
    answer:
      "You can track all your orders in the Orders section of this portal. Each order shows real-time status updates from factory production through customs clearance to final delivery. You will also receive WhatsApp notifications at key milestones.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept bank transfers (NEFT/RTGS/IMPS), UPI payments, and cheques. All payment details are shared by your account manager. You can view your payment history and pending dues in the Payments section.",
  },
  {
    question: "Can I customize the products for my store?",
    answer:
      "Yes! During the inventory selection phase, you can work with your account manager to choose from our product catalog. You can select categories, adjust quantities, and even request custom branding on select products based on your package tier.",
  },
  {
    question: "What happens after my store launches?",
    answer:
      "Post-launch, you get continued support including reorder assistance, marketing guidance, inventory management tips, and access to new product launches. Our team conducts monthly review calls to help optimize your store performance.",
  },
  {
    question: "How do I place a reorder?",
    answer:
      "Once your store is launched, you can place reorders through the Orders section or by contacting your account manager. Reorders typically have a faster turnaround of 30-45 days since your store setup is already complete.",
  },
  {
    question: "What if I face issues with product quality?",
    answer:
      "We have a dedicated quality assurance process. If you receive any defective items, report them within 7 days of delivery through this portal or contact support. We will arrange replacements at no additional cost for manufacturing defects.",
  },
];

export default function EtsPortalSupport() {
  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-support-title">
            Support
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-support-subtitle">
            Get help from the EazyToSell team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTACT_CHANNELS.map((channel) => (
            <Card key={channel.id} className="p-5 space-y-4" data-testid={`card-contact-${channel.id}`}>
              <div className="flex items-start gap-3">
                <div
                  className="size-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(249, 115, 22, 0.12)" }}
                >
                  <channel.icon className="size-5" style={{ color: ETS_PORTAL_COLOR }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" data-testid={`text-channel-title-${channel.id}`}>
                    {channel.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {channel.description}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium" data-testid={`text-channel-detail-${channel.id}`}>
                {channel.detail}
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: ETS_PORTAL_COLOR }}
                asChild
                data-testid={`button-contact-${channel.id}`}
              >
                <a href={channel.href} target="_blank" rel="noopener noreferrer">
                  {channel.action}
                </a>
              </Button>
            </Card>
          ))}
        </div>

        <SectionCard title="Support Hours">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="size-4" style={{ color: ETS_PORTAL_COLOR }} />
              <span className="text-sm font-medium">Business Hours (IST)</span>
            </div>
            {SUPPORT_HOURS.map((item) => (
              <div
                key={item.day}
                className="flex items-center justify-between gap-4"
                data-testid={`text-hours-${item.day.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <span className="text-sm">{item.day}</span>
                <Badge variant={item.hours === "Closed" ? "secondary" : "outline"}>
                  {item.hours}
                </Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-3">
              For urgent issues outside business hours, please send a WhatsApp message and we will respond as soon as possible.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Frequently Asked Questions">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="size-4" style={{ color: ETS_PORTAL_COLOR }} />
            <span className="text-sm text-muted-foreground">
              Find answers to common questions about the EazyToSell franchise program
            </span>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} data-testid={`accordion-faq-${index}`}>
                <AccordionTrigger className="text-sm text-left" data-testid={`button-faq-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-faq-answer-${index}`}>
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionCard>
      </div>
    </PageShell>
  );
}
