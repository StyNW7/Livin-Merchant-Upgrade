import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { ProgressRing } from "@/components/common/ProgressBar";
import { useData } from "@/hooks/useApp";
import { learningModules } from "@/data/learning";

export default function LearnPage() {
  const { learningProgress } = useData();
  const completed = learningModules.filter((m) => (learningProgress[m.id] ?? 0) >= m.lessons.length).length;

  return (
    <>
      <TopAppBar title="Learn" subtitle="Short lessons to run your business better" />
      <PageBody>
        <section className="hero-navy flex items-center gap-4 rounded-[28px] p-5 text-white">
          <ProgressRing value={(completed / learningModules.length) * 100} size={72} stroke={8} tone="#FFB600" track="rgba(255,255,255,0.15)">
            <span className="text-[15px] font-extrabold">
              {completed}/{learningModules.length}
            </span>
          </ProgressRing>
          <div>
            <p className="text-[16px] font-extrabold">Business Learning Center</p>
            <p className="text-[12.5px] leading-relaxed text-white/85">Each module takes under 10 minutes. Some lessons also complete Growth Missions.</p>
          </div>
        </section>

        <div className="space-y-3">
          {learningModules.map((m) => {
            const done = learningProgress[m.id] ?? 0;
            const pct = Math.round((done / m.lessons.length) * 100);
            return (
              <Link key={m.id} to={`/learn/${m.id}`} className="card flex items-center gap-4 p-4 transition hover:shadow-float">
                <ProgressRing value={pct} size={52} stroke={5} tone={pct === 100 ? "#12A36D" : "#5192F6"}>
                  {pct === 100 ? <CheckCircle2 className="h-5 w-5 text-success" /> : <BookOpen className="h-5 w-5 text-navy-600" />}
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-ink">{m.title}</p>
                  <p className="text-[12.5px] leading-snug text-ink-muted">{m.summary}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[11.5px] font-semibold text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {m.minutes} min
                    </span>
                    <span>{pct === 100 ? "Completed" : done ? `${done} of ${m.lessons.length} lessons` : "Not started"}</span>
                    {m.missionId && (
                      <span className="inline-flex items-center gap-1 text-gold-700">
                        <Target className="h-3.5 w-3.5" /> Growth Mission
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}
