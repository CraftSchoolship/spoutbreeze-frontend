import React from "react";
import StreamIcon from "@mui/icons-material/Podcasts";
import SpacesIcon from "@mui/icons-material/Dashboard";
import RecordIcon from "@mui/icons-material/VideoLibrary";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import IntegrationIcon from "@mui/icons-material/Extension";

const features = [
  {
    icon: StreamIcon,
    title: "Seamless Streaming",
    description: "Host smooth, high-quality live sessions with crystal-clear audio and video.",
    color: "#0ea5e9",
  },
  {
    icon: SpacesIcon,
    title: "Personalized Spaces",
    description: "Create branded environments tailored perfectly to your audience.",
    color: "#06b6d4",
  },
  {
    icon: RecordIcon,
    title: "Smart Recordings",
    description: "Automatically store, manage, and share your past webinars with ease.",
    color: "#14b8a6",
  },
  {
    icon: SecurityIcon,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance to keep your data protected.",
    color: "#0284c7",
  },
  {
    icon: AnalyticsIcon,
    title: "Real-time Analytics",
    description: "Track engagement, attendance, and performance with detailed insights.",
    color: "#0891b2",
  },
  {
    icon: IntegrationIcon,
    title: "Easy Integrations",
    description: "Connect with your favorite tools like Zoom, Slack, and more.",
    color: "#0d9488",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-white py-24 px-6 sm:px-8 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-sky-500 bg-sky-50 px-4 py-2 rounded-full mb-4">
            FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to{" "}
            <span className="gradient-text">scale</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Powerful tools designed to make every virtual event a success, from small meetings to large conferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: `${feature.color}15`,
                  }}
                >
                  <IconComponent 
                    sx={{ 
                      fontSize: 28,
                      color: feature.color,
                    }} 
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
