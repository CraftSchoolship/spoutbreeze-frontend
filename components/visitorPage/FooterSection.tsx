import React from "react";
import TalkToFounders from "./TalkToFounders";

const FooterSection: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-10 px-6 sm:px-8 lg:px-24">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          <span className="font-semibold gradient-text">BlueScale</span> — webinars that bill per
          moderator, not per attendee.
        </p>
        <TalkToFounders />
      </div>
    </footer>
  );
};

export default FooterSection;
