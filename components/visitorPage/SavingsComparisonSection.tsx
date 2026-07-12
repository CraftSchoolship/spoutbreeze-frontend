import React from "react";

const rows = [
  { attendees: "500", traditional: "$5,200/mo", blueScale: "$200/mo", savings: "96%" },
  { attendees: "2,000", traditional: "$20,200/mo", blueScale: "$200/mo", savings: "99%" },
  { attendees: "8,000", traditional: "$80,200/mo", blueScale: "$200/mo", savings: "99.75%" },
];

const SavingsComparisonSection: React.FC = () => {
  return (
    <section aria-labelledby="savings-heading" className="bg-slate-50 py-24 px-6 sm:px-8 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-sky-500 bg-sky-50 px-4 py-2 rounded-full mb-4">
            PRICING
          </span>
          <h2 id="savings-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Cost comparison: BlueScale vs traditional webinar platforms
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            BlueScale bills only for moderators. Attendees watch free streams via YouTube or Twitch.
            Traditional platforms charge per attendee.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left">
            <caption className="caption-bottom px-6 py-4 text-sm text-slate-400 border-t border-slate-100">
              Monthly cost by audience size (5 moderators, 4 events/month)
            </caption>
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-6 py-4">Attendees</th>
                <th scope="col" className="px-6 py-4">Traditional platforms</th>
                <th scope="col" className="px-6 py-4">BlueScale</th>
                <th scope="col" className="px-6 py-4">Savings</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.attendees} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-700">{row.attendees}</td>
                  <td className="px-6 py-4 font-bold text-red-500">{row.traditional}</td>
                  <td className="px-6 py-4 font-bold text-teal-600">{row.blueScale}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{row.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-400 text-center mt-6">
          <strong className="text-slate-500">Formula —</strong> Traditional: ceil((attendees + moderators) / 20) × $50 × events. BlueScale: ceil(moderators / 20) × $50 × events.
        </p>
      </div>
    </section>
  );
};

export default SavingsComparisonSection;
