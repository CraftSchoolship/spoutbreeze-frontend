import React from "react";

export const faqs = [
  {
    question: "How is BlueScale's pricing different from Zoom Webinar or Livestorm?",
    answer:
      "Traditional webinar platforms bill for every attendee. BlueScale bills only for moderators ($50 per block of 20 moderators) and streams to attendees for free via YouTube or Twitch. A 2,000-attendee webinar costs ~$20,200/mo on traditional tools versus ~$200/mo on BlueScale — about 99% less.",
  },
  {
    question: "What does BlueScale cost for a 500, 2,000, or 8,000-attendee event?",
    answer:
      "BlueScale is $200/month flat for up to 20 moderators regardless of audience size. Traditional platforms charge approximately $5,200/mo at 500 attendees, $20,200/mo at 2,000, and $80,200/mo at 8,000.",
  },
  {
    question: "How does BlueScale stream to so many attendees cheaply?",
    answer:
      "BlueScale uses YouTube and Twitch as the attendee delivery layer (free, unlimited scale) while running the moderator/host experience and bidirectional chat sync on its own infrastructure.",
  },
  {
    question: "What integrations does BlueScale support?",
    answer:
      "BlueScale integrates with Zoom, Slack, YouTube, and Twitch among other tools.",
  },
];

const FAQSection: React.FC = () => {
  return (
    <section className="bg-slate-50 py-24 px-6 sm:px-8 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-sky-500 bg-sky-50 px-4 py-2 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-sky-200 transition-all duration-300"
            >
              <summary className="cursor-pointer list-none px-8 py-6 text-lg font-semibold text-slate-900 flex items-center justify-between gap-4">
                {faq.question}
                <span className="text-sky-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-8 pb-6 text-slate-500 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
