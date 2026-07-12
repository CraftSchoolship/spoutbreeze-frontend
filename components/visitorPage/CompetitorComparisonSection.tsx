import React from "react";

const competitors = [
  { platform: "Zoom Webinar", model: "Per attendee tier", cost: "~$690+/mo (1k tier)", cap: "Tiered" },
  { platform: "Livestorm", model: "Per active contact", cost: "~$800+/mo", cap: "Tiered" },
  { platform: "Demio", model: "Per registrant", cost: "~$400+/mo", cap: "Tiered" },
];

const CompetitorComparisonSection: React.FC = () => {
  return (
    <section aria-labelledby="compare-heading" className="bg-white py-24 px-6 sm:px-8 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-sky-500 bg-sky-50 px-4 py-2 rounded-full mb-4">
            COMPARISON
          </span>
          <h2 id="compare-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            BlueScale vs Zoom Webinar, Livestorm, and Demio
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Most webinar platforms charge per registrant or attendee, so your bill scales with your
            success. BlueScale flips that: you pay a flat fee per moderator and your audience streams
            free via YouTube or Twitch. Here&apos;s how the math compares for a typical 2,000-attendee
            monthly webinar with 5 moderators.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Pricing model</th>
                <th className="px-6 py-4">Approx monthly cost</th>
                <th className="px-6 py-4">Attendee cap</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((row) => (
                <tr key={row.platform} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-700">{row.platform}</td>
                  <td className="px-6 py-4 text-slate-500">{row.model}</td>
                  <td className="px-6 py-4 font-bold text-red-500">{row.cost}</td>
                  <td className="px-6 py-4 text-slate-500">{row.cap}</td>
                </tr>
              ))}
              <tr className="border-t border-teal-100 bg-teal-50/60">
                <td className="px-6 py-4 text-teal-700"><strong>BlueScale</strong></td>
                <td className="px-6 py-4 text-teal-700"><strong>Per moderator (flat)</strong></td>
                <td className="px-6 py-4 text-teal-600"><strong>$200/mo</strong></td>
                <td className="px-6 py-4 text-teal-700"><strong>Unlimited via YouTube/Twitch</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-400 text-center mt-6">
          <em>Competitor prices are approximate list rates as of 2024 and may vary by region and contract.</em>
        </p>
      </div>
    </section>
  );
};

export default CompetitorComparisonSection;
