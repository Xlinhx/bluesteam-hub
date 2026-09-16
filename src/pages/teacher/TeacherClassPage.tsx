import { useRouter, matchRoute } from '../../app/router';
import { useTheme } from '../../themes/ThemeProvider';
import { TeacherShell } from '../../shells/TeacherShell';
import { SEED_CLASSES } from '../../content/seed/classes';
import { SEED_STUDENTS } from '../../content/seed/students';
import { SEED_LESSONS } from '../../content/seed/lessons';
import {
  ArrowLeft,
  Users,
  Play,
  Clock,
  CheckCircle2,
  Fish,
} from 'lucide-react';

export function TeacherClassPage() {
  const { currentPath, navigate } = useRouter();
  useTheme();

  const match = matchRoute('/teacher/class/:classId', currentPath);
  const classId = match.params.classId || SEED_CLASSES[0].id;
  const currentClass = SEED_CLASSES.find((c) => c.id === classId) || SEED_CLASSES[0];

  const enrolledStudents = SEED_STUDENTS.filter((s) =>
    currentClass.enrolledStudentIds.includes(s.id)
  );

  const activeLesson = SEED_LESSONS.find((l) => l.id === currentClass.activeLessonId) || SEED_LESSONS[0];

  return (
    <TeacherShell activeNav="live">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher')}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#102A38] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[11px] font-bold text-[#17657A] uppercase tracking-wider block">
                Danh sách lớp & Thời khóa biểu
              </span>
              <h1 className="font-serif font-bold text-xl text-[#102A38]">
                {currentClass.name}
              </h1>
            </div>
          </div>

          <button
            onClick={() => navigate('/teacher/live')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#17657A] hover:bg-[#124e5f] text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Vào phiên học trực tiếp</span>
          </button>
        </div>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Class Overview Banner */}
        <div className="bg-surface-elevated rounded-3xl p-8 border border-borderUi-soft shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold">
                {currentClass.roomNumber}
              </span>
              <span className="text-xs font-mono text-ink-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentClass.scheduleTime}</span>
              </span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-ink-primary">
              {currentClass.name}
            </h2>
            <p className="text-xs text-ink-secondary">
              Grade Band: {currentClass.gradeBand} · {currentClass.totalStudents} Active Young Explorers
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-sunken border border-borderUi-soft text-xs space-y-1">
            <span className="font-mono text-[10px] text-ink-muted uppercase block">Current Assigned Plan</span>
            <span className="font-bold text-ink-primary block">{activeLesson.title}</span>
            <span className="text-brand-primary font-mono text-[11px]">{activeLesson.experiences.length} Experiences Queued</span>
          </div>
        </div>

        {/* Enrolled Students Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-ink-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              <span>Enrolled Student Explorers ({enrolledStudents.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {enrolledStudents.map((student) => (
              <div
                key={student.id}
                className="bg-surface-elevated rounded-2xl p-5 border border-borderUi-soft shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                    <Fish className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-sunken text-ink-muted">
                    {student.grade}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-ink-primary">{student.name}</h4>
                  <p className="text-[11px] font-mono text-ink-muted">{student.symbolName}</p>
                </div>

                <div className="pt-2 border-t border-borderUi-soft/60 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Device</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
    </TeacherShell>
  );
}
