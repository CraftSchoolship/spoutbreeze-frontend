import FeaturesSection from "@/components/visitorPage/FeaturesSection";
import HeroSection from "@/components/visitorPage/HeroSection";
import SavingsComparisonSection from "@/components/visitorPage/SavingsComparisonSection";
import CompetitorComparisonSection from "@/components/visitorPage/CompetitorComparisonSection";
import FAQSection, { faqs } from "@/components/visitorPage/FAQSection";
import FooterSection from "@/components/visitorPage/FooterSection";

const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BlueScale",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Webinar Platform",
    operatingSystem: "Web",
    description:
        "BlueScale is a webinar and virtual-event platform with flat pricing: customers pay only for moderators while attendees watch free streams via YouTube or Twitch.",
    offers: {
        "@type": "Offer",
        price: "50",
        priceCurrency: "USD",
        description: "$50 per moderator block (per 20 moderators), unlimited attendees",
    },
    featureList: [
        "Flat pricing — pay per moderator, not per attendee",
        "Free attendee streaming via YouTube and Twitch",
        "Bidirectional chat sync",
        "Smart recordings",
        "Real-time analytics",
        "Enterprise-grade security",
    ],
    url: "https://bluescale.craftschoolship.com/",
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
        },
    })),
};

export default function HomePage() {
    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <HeroSection />
        <SavingsComparisonSection />
        <FeaturesSection />
        <CompetitorComparisonSection />
        <FAQSection />
        <FooterSection />
        </>
    );
}
