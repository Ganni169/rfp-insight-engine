import { AlertCircle, CalendarClock, ChevronRight } from "lucide-react";

export interface CriticalDeadline {
  deadline_description: string;
  date_time: string;
  delivery_format: string;
}

interface DeadlinesSidebarProps {
  deadlines: CriticalDeadline[];
  evaluationCriteria: string;
}

export function DeadlinesSidebar({ deadlines, evaluationCriteria }: DeadlinesSidebarProps) {
  if (!deadlines || deadlines.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-xl">
        <h3 className="text-lg font-semibold flex items-center mb-4 text-foreground">
          <CalendarClock className="w-5 h-5 mr-2 text-primary" />
          Critical Deadlines
        </h3>
        <div className="space-y-4">
          {deadlines.map((dl, i) => (
            <div key={i} className="pl-4 border-l-2 border-primary/40 relative">
              <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-1"></div>
              <p className="text-sm font-medium text-foreground">{dl.deadline_description}</p>
              <p className="text-sm font-bold text-primary mt-1">{dl.date_time}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ChevronRight className="w-3 h-3 mr-1" /> Format: {dl.delivery_format}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm p-6 shadow-xl">
        <h3 className="text-lg font-semibold flex items-center mb-2 text-amber-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          Evaluation Criteria
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {evaluationCriteria}
        </p>
      </div>
    </div>
  );
}
