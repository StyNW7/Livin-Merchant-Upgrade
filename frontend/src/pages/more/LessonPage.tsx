import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Trophy } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useData, useUI } from "@/hooks/useApp";
import { learningModules } from "@/data/learning";

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { learningProgress, completeLesson } = useData();
  const { toast } = useUI();
  const module = learningModules.find((m) => m.id === id);
  const done = module ? learningProgress[module.id] ?? 0 : 0;
  const [index, setIndex] = useState(module ? Math.min(done, module.lessons.length - 1) : 0);
  const [finished, setFinished] = useState(module ? done >= module.lessons.length : false);
  if (!module) return <Navigate to="/learn" replace />;

  const lesson = module.lessons[index];
  const last = index === module.lessons.length - 1;

  const next = () => {
    completeLesson(module.id, index);
    if (last) {
      setFinished(true);
      toast(module.missionId ? "Module complete. Growth Mission progress updated." : "Module complete");
    } else setIndex(index + 1);
  };

  return (
    <>
      <TopAppBar title={module.title} subtitle={`${module.minutes} min · ${module.lessons.length} lessons`} backTo="/learn" />
      <PageBody>
        {finished ? (
          <section className="card flex flex-col items-center p-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy-900">
              <Trophy className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-[20px] font-extrabold text-ink">Module completed</h2>
            <p className="mt-1 text-[13.5px] text-ink-muted">You finished {module.title}.</p>
            {module.missionId && (
              <Button className="mt-5" onClick={() => navigate("/growth/missions")}>
                Claim your Growth Mission
              </Button>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => { setFinished(false); setIndex(0); }}>
                Review lessons
              </Button>
              <Button variant="ghost" onClick={() => navigate("/learn")}>
                More modules
              </Button>
            </div>
          </section>
        ) : (
          <>
            <div>
              <div className="mb-2 flex justify-between text-[12px] font-semibold text-ink-muted">
                <span>
                  Lesson {index + 1} of {module.lessons.length}
                </span>
                {index < done && (
                  <span className="inline-flex items-center gap-1 text-success-dark">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                  </span>
                )}
              </div>
              <ProgressBar value={index + 1} max={module.lessons.length} tone="gold" size="md" />
            </div>
            <article key={index} className="card animate-screen-in p-5">
              <h2 className="text-[20px] font-extrabold leading-tight text-ink">{lesson.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{lesson.body}</p>
            </article>
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <Button variant="secondary" size="lg" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="Previous lesson">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button size="lg" onClick={next} rightIcon={<ArrowRight className="h-4 w-4" />}>
                {last ? "Complete module" : "Next lesson"}
              </Button>
            </div>
          </>
        )}
      </PageBody>
    </>
  );
}
