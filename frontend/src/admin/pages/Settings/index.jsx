import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Badge } from "../../components/ui/Badge";

export default function Settings() {
  const configCards = [
    {
      title: "Departments",
      description: "Manage municipal organization schemas, departments, heads, contact lines, and active personnel profiles."
    },
    {
      title: "Categories",
      description: "Configure report categories (e.g. Roads, Water), SLA timelines, and severity triggers."
    },
    {
      title: "Roles & Permissions",
      description: "Assign access profiles for dispatch officers, division engineers, and municipal administrators."
    },
    {
      title: "Admin Accounts",
      description: "Configure active supervisor login profiles, security tokens, and permission rosters."
    },
    {
      title: "System Preferences",
      description: "Manage global map coordinates, default telemetry refresh cycles, and storage indices."
    },
    {
      title: "Notification Templates",
      description: "Configure SMS and email templates dispatched during ticket resolution status transitions."
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        subtitle="Manage command permissions, API tokens, and municipality parameters"
      />
      
      <div className="space-y-4">
        <SectionTitle title="System Oversight Preferences" subtitle="Platform schema overrides and global authority rules" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configCards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-gray-700 transition duration-200 flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex justify-between items-center gap-2 mb-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-gray-300 uppercase tracking-wider">
                    {card.title}
                  </h4>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
