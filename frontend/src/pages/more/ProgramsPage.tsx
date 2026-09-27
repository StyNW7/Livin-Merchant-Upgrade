import { CalendarDays, Info } from "lucide-react";
import type { MerchantProgram } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { DemoTag, StatusBadge } from "@/components/common/StatusBadge";
import { useData, useUI } from "@/hooks/useApp";
import { PROGRAM_NOTE, merchantPrograms } from "@/data/learning";

const SECTIONS: MerchantProgram["section"][] = ["Merchant Programs", "Growth Challenges", "Livin'poin", "Business Events", "Education", "Community"];

export default function ProgramsPage() {
  const { joinedPrograms, toggleProgram } = useData();
  const { toast } = useUI();

  return (
    <>
      <TopAppBar title="Program Center" subtitle="Livin’ Merchant programs" right={<DemoTag label="Concept" />} />
      <PageBody>
        <p className="flex gap-2 rounded-2xl bg-navy-50 px-4 py-3 text-[12px] leading-relaxed text-ink-soft">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
          {PROGRAM_NOTE}
        </p>
        {SECTIONS.map((section) => {
          const items = merchantPrograms.filter((p) => p.section === section);
          if (!items.length) return null;
          return (
            <section key={section}>
              <h2 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">{section}</h2>
              <div className="space-y-3">
                {items.map((p) => {
                  const joined = joinedPrograms.includes(p.id);
                  const joinable = p.status !== "Active" || p.section === "Growth Challenges" || p.section === "Community";
                  return (
                    <article key={p.id} className="card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[15px] font-bold text-ink">{p.title}</p>
                        <StatusBadge status={joined ? "Joined" : p.status} tone={joined ? "success" : p.status === "Active" ? "success" : p.status === "Registration Open" ? "gold" : "info"} />
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{p.description}</p>
                      {p.date && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
                          <CalendarDays className="h-3.5 w-3.5" /> {p.date}
                        </p>
                      )}
                      {joinable && (
                        <Button
                          block
                          size="sm"
                          variant={joined ? "secondary" : "primary"}
                          className="mt-3"
                          onClick={() => {
                            toggleProgram(p.id);
                            toast(joined ? `You left ${p.title}` : `You joined ${p.title}`);
                          }}
                        >
                          {joined ? "Leave" : p.status === "Registration Open" ? "Register" : p.status === "Upcoming" ? "Remind me" : "Join"}
                        </Button>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </PageBody>
    </>
  );
}
