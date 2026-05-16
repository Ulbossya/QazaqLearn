import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
import { api, clearSession, getRole, getToken, roleDashboard, Role, Session, setSession } from "./api";
import html2pdf from "html2pdf.js";


type Course = {
  id: string;
  titleRu?: string | null;
  titleKz?: string | null;
  descriptionRu?: string | null;
  descriptionKz?: string | null;
  status?: string;
  percent?: number;
  price?: number;
  categoryId?: string;
  contentSummary?: ContentSummary;
  scoreSummary?: ScoreSummary;
};

type Paginated<T> = { items: T[]; meta: { total: number } };

type ContentSummary = {
  materialCount: number;
  testCount: number;
  questionCount?: number;
  enrollmentCount?: number;
};

type ScoreSummary = {
  attemptedTests: number;
  passedLatestTests: number;
  latestAverageScore: number | null;
  bestScore: number | null;
};

type CourseProgress = {
  percent: number;
  completedMaterials: number;
  totalMaterials: number;
  passedTests: number;
  totalTests: number;
  scoreSummary?: ScoreSummary;
};

type CourseDetail = Course & {
  category?: { nameRu?: string | null; nameKz?: string | null };
  materials?: Array<{
    id: string;
    titleRu?: string | null;
    titleKz?: string | null;
    type: string;
    orderIndex: number;
    fileUrl?: string | null;
    videoUrl?: string | null;
  }>;
  tests?: Array<{
    id: string;
    titleRu?: string | null;
    titleKz?: string | null;
    passScore: number;
    durationMinutes: number;
    questions: TestQuestion[];
  }>;
  studentProgress?: CourseProgress | null;
  studentEnrollment?: { status: string } | null;
  managementSummary?: {
    enrollmentCount: number;
    completedStudents: number;
    averageProgress: number;
  };
};

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingOrRedirect />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route path="/student" element={<Protected allow={["STUDENT"]}><Shell><StudentDashboard /></Shell></Protected>} />
      <Route path="/courses" element={<Protected><Shell><CoursesPage /></Shell></Protected>} />
      <Route path="/courses/:id" element={<Protected><Shell><CourseDetailPage /></Shell></Protected>} />
      <Route path="/my-courses" element={<Protected allow={["STUDENT"]}><Shell><MyCoursesPage /></Shell></Protected>} />
      <Route path="/materials/:id" element={<Protected><Shell><MaterialPage /></Shell></Protected>} />
      <Route path="/tests/:testId" element={<Protected><Shell><TestPage /></Shell></Protected>} />
      <Route path="/progress/:courseId" element={<Protected><Shell><ProgressPage /></Shell></Protected>} />
      <Route path="/ai" element={<Protected><Shell><AiPage /></Shell></Protected>} />
      <Route path="/notifications" element={<Protected><Shell><NotificationsPage /></Shell></Protected>} />

      <Route path="/teacher" element={<Protected allow={["TEACHER"]}><Shell><TeacherDashboard /></Shell></Protected>} />
      <Route path="/teacher/courses" element={<Protected allow={["TEACHER"]}><Shell><TeacherCoursesPage /></Shell></Protected>} />
      <Route path="/teacher/courses/create" element={<Protected allow={["TEACHER"]}><Shell><CourseFormPage /></Shell></Protected>} />
      <Route path="/teacher/courses/:id/edit" element={<Protected allow={["TEACHER"]}><Shell><CourseFormPage /></Shell></Protected>} />
      <Route path="/teacher/courses/:id/materials" element={<Protected allow={["TEACHER"]}><Shell><TeacherMaterialsPage /></Shell></Protected>} />
      <Route path="/teacher/courses/:id/tests" element={<Protected allow={["TEACHER"]}><Shell><TeacherTestsPage /></Shell></Protected>} />
      <Route path="/teacher/courses/:id/students" element={<Protected allow={["TEACHER"]}><Shell><TeacherStudentsPage /></Shell></Protected>} />
      <Route path="/teacher/courses/:id/ai-test-gen" element={<Protected allow={["TEACHER", "ADMIN"]}><Shell><TeacherTestGenPage /></Shell></Protected>} />

      <Route path="/admin" element={<Protected allow={["ADMIN"]}><Shell><AdminDashboard /></Shell></Protected>} />
      <Route path="/admin/users" element={<Protected allow={["ADMIN"]}><Shell><AdminUsersPage /></Shell></Protected>} />
      <Route path="/admin/courses" element={<Protected allow={["ADMIN"]}><Shell><AdminCoursesPage /></Shell></Protected>} />
      <Route path="/admin/audit-logs" element={<Protected allow={["ADMIN"]}><Shell><AdminAuditPage /></Shell></Protected>} />
      <Route path="/admin/ai-history" element={<Protected allow={["ADMIN"]}><Shell><AdminAiHistoryPage /></Shell></Protected>} />
      <Route path="/admin/categories" element={<Protected allow={["ADMIN"]}><Shell><AdminCategoriesPage /></Shell></Protected>} />

      <Route path="*" element={<Navigate to={getToken() ? roleDashboard(getRole()) : "/"} replace />} />
    </Routes>
  );
}

function LandingOrRedirect() {
  if (getToken()) return <Navigate to={roleDashboard(getRole())} replace />;
  return <LandingPage />;
}

function Protected({ children, allow }: { children: ReactNode; allow?: Role[] }) {
  const token = getToken();
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (allow && (!role || !allow.includes(role))) return <Navigate to={roleDashboard(role)} replace />;
  return <>{children}</>;
}

function Shell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();

  const nav = useMemo<Array<[string, string, ReactNode]>>(() => {
    const base: Array<[string, string, ReactNode]> = [
      ["/courses", t("courses"), <Icon name="book" />],
      ["/ai", t("ai"), <Icon name="sparkle" />],
      ["/notifications", t("notifications"), <Icon name="bell" />]
    ];
    if (role === "STUDENT") {
      return [
        ["/student", t("dashboard"), <Icon name="home" />],
        ["/my-courses", t("myCourses"), <Icon name="bookmark" />],
        ...base
      ];
    }
    if (role === "TEACHER") {
      return [
        ["/teacher", t("dashboard"), <Icon name="home" />],
        ["/teacher/courses", t("courses"), <Icon name="book" />],
        ["/teacher/courses/create", t("createCourse"), <Icon name="plus" />],
        ...base
      ];
    }
    return [
      ["/admin", t("dashboard"), <Icon name="home" />],
      ["/admin/users", t("users"), <Icon name="users" />],
      ["/admin/courses", t("courses"), <Icon name="book" />],
      ["/admin/categories", t("categories"), <Icon name="grid" />],
      ["/admin/audit-logs", t("auditLogs"), <Icon name="shield" />],
      ["/admin/ai-history", t("aiHistory"), <Icon name="sparkle" />]
    ];
  }, [role, t]);

  const roleLabel = role === "ADMIN" ? t("admin") : role === "TEACHER" ? t("teacher") : t("student");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to={roleDashboard(role)}>
          <span className="brand-mark">QL</span>
          QazaqLearn
        </Link>
        <span className="role-pill"><Icon name="user" /> {roleLabel}</span>
        <nav aria-label="Main navigation">
          {nav.map(([href, label, icon]) => {
            const active = href === "/student" || href === "/teacher" || href === "/admin"
              ? location.pathname === href
              : location.pathname.startsWith(href);
            return (
              <Link key={href} to={href} className={active ? "active" : ""}>
                <span className="nav-icon">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <LanguageSwitch />
          <button
            type="button"
            className="ghost"
            onClick={() => {
              clearSession();
              navigate("/login");
            }}
          >
            {t("logout")}
          </button>
        </div>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
}

function LanguageSwitch() {
  const { t } = useTranslation();
  return (
    <div className="language" aria-label={t("languageSwitch")}>
      <button type="button" className={i18n.language === "kz" ? "active" : ""} onClick={() => switchLanguage("kz")}>KZ</button>
      <button type="button" className={i18n.language === "ru" ? "active" : ""} onClick={() => switchLanguage("ru")}>RU</button>
    </div>
  );
}

function switchLanguage(language: "ru" | "kz") {
  localStorage.setItem("qazaqlearn.language", language);
  void i18n.changeLanguage(language);
}

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":
      return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>;
    case "book":
      return <svg {...common}><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>;
    case "bookmark":
      return <svg {...common}><path d="M6 3h12v18l-6-4-6 4z" /></svg>;
    case "sparkle":
      return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>;
    case "bell":
      return <svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "users":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "grid":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6z" /></svg>;
    case "chart":
      return <svg {...common}><path d="M3 3v18h18" /><path d="M7 16v-4M12 16V8M17 16v-7" /></svg>;
    case "robot":
      return <svg {...common}><rect x="4" y="7" width="16" height="12" rx="2" /><circle cx="9" cy="13" r="1.2" /><circle cx="15" cy="13" r="1.2" /><path d="M12 3v4M9 19v2M15 19v2" /></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
    case "cloud":
      return <svg {...common}><path d="M7 18a4 4 0 1 1 .6-7.96A6 6 0 0 1 19 13h.5a3.5 3.5 0 0 1 0 7H7z" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 5 5L20 7" /></svg>;
    case "arrow-right":
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
    default:
      return null;
  }
}

function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">QL</span>
          QazaqLearn
        </Link>
        <div className="nav-actions">
          <LanguageSwitch />
          <Link to="/login" className="ghost" style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border-strong)" }}>{t("login")}</Link>
          <Link to="/register" className="primary-link">{t("register")} <Icon name="arrow-right" /></Link>
        </div>
      </header>

      <main className="landing-body">
        <section className="landing-hero">
          <span className="eyebrow">{t("landingLanguage")}</span>
          <h1>QazaqLearn</h1>
          <p className="lead">{t("landingLead")}</p>
          <div className="cta">
            <Link to="/register" className="primary-link">{t("createAccount")} <Icon name="arrow-right" /></Link>
            <Link to="/login" className="ghost" style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border-strong)" }}>{t("login")}</Link>
          </div>
        </section>

        <section className="landing-roles" aria-label={t("roles")}>
          <article>
            <h2>{t("studentsFor")}</h2>
            <p>{t("studentsForDesc")}</p>
          </article>
          <article>
            <h2>{t("teachersFor")}</h2>
            <p>{t("teachersForDesc")}</p>
          </article>
          <article>
            <h2>{t("adminsFor")}</h2>
            <p>{t("adminsForDesc")}</p>
          </article>
        </section>
      </main>
    </div>
  );
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    preferredLanguage: i18n.language
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const session = await api<Session>(endpoint, { method: "POST", body: JSON.stringify(payload) });
      setSession(session);
      navigate(roleDashboard(session.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  return (
    <main className="auth-screen">
      <aside className="auth-hero">
        <Link to="/" className="brand" style={{ color: "#fff" }}>
          <span className="brand-mark">QL</span>
          QazaqLearn
        </Link>
        <div>
          <h1>QazaqLearn</h1>
          <p>{mode === "login" ? t("authLoginLead") : t("authRegisterLead")}</p>
        </div>
      </aside>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div>
          <span className="eyebrow">QazaqLearn</span>
          <h1 id="auth-title">{mode === "login" ? t("login") : t("register")}</h1>
          <p className="muted">{t("landingLanguage")}</p>
        </div>
        <LanguageSwitch />
        <form onSubmit={submit} className="form">
          <label>{t("email")}<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required /></label>
          <label>{t("password")}<input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" minLength={8} required /></label>
          {mode === "register" && (
            <label>{t("fullName")}<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} minLength={2} required /></label>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit">{mode === "login" ? t("login") : t("register")}</button>
        </form>
        <Link to={mode === "login" ? "/register" : "/login"} className="switch-link">
          {mode === "login" ? `→ ${t("register")}` : `→ ${t("login")}`}
        </Link>
      </section>
    </main>
  );
}

function StudentDashboard() {
  const { t } = useTranslation();
  const myCourses = useQuery({ queryKey: ["my-courses"], queryFn: () => api<Array<{ course: Course; status: string }>>("/enrollments/my") });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => api<Paginated<unknown>>("/notifications") });
  return (
    <Page
      title={`${t("welcome")}, ${t("student")}`}
      subtitle={t("studentDashboardSubtitle")}
      actions={<Link className="primary-link" to="/ai">{t("aiAssistant")} <Icon name="arrow-right" /></Link>}
    >
      <MetricGrid
        items={[
          { label: t("myCourses"), value: myCourses.data?.length ?? 0, icon: "book" },
          { label: t("notifications"), value: notifications.data?.meta.total ?? 0, icon: "bell", tone: "accent" },
          { label: t("aiAssistant"), value: t("ready"), icon: "sparkle", tone: "info" }
        ]}
      />
      <Section title={t("myCourses")} empty={!myCourses.isLoading && !myCourses.data?.length} emptyText={t("noCourses")}>
        {myCourses.isLoading ? <Status text={t("loading")} /> : (
          <div className="course-grid">
            {myCourses.data?.map((item) => <CourseCard key={item.course.id} course={item.course} href={`/courses/${item.course.id}`} />)}
          </div>
        )}
      </Section>
    </Page>
  );
}

function TeacherDashboard() {
  const { t } = useTranslation();
  const courses = useQuery({ queryKey: ["teacher-courses"], queryFn: () => api<Paginated<Course>>("/teacher/courses?limit=50") });
  const drafts = courses.data?.items.filter((c) => c.status === "DRAFT").length ?? 0;
  const published = courses.data?.items.filter((c) => c.status === "PUBLISHED").length ?? 0;
  return (
    <Page
      title={`${t("welcome")}, ${t("teacher")}`}
      subtitle={t("teacherDashboardSubtitle")}
      actions={<Link className="primary-link" to="/teacher/courses/create"><Icon name="plus" /> {t("createCourse")}</Link>}
    >
      <MetricGrid
        items={[
          { label: t("courses"), value: courses.data?.meta.total ?? 0, icon: "book" },
          { label: t("statusPublished"), value: published, icon: "check", tone: "info" },
          { label: t("statusDraft"), value: drafts, icon: "bookmark", tone: "accent" },
          { label: t("aiAssistant"), value: t("ready"), icon: "robot", tone: "info" }
        ]}
      />
      <Section title={t("courses")} empty={!courses.isLoading && !courses.data?.items.length} emptyText={t("noCourses")}>
        <div className="course-grid">
          {courses.data?.items.map((course) => <CourseCard key={course.id} course={course} href={`/teacher/courses/${course.id}/edit`} />)}
        </div>
      </Section>
    </Page>
  );
}

function AdminDashboard() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => api<{ users?: number; courses?: number; aiRequests?: number; blockedUsers?: number; auditLogs?: Array<{ id: string; action: string; entityType: string; createdAt: string; actor?: { fullName?: string } | null }> }>("/admin/dashboard") });
  const recent = data.data?.auditLogs ?? [];
  return (
    <Page title={t("adminDashboard")} subtitle={t("adminDashboardDesc")}>
      <MetricGrid
        items={[
          { label: t("users"), value: data.data?.users ?? 0, icon: "users" },
          { label: t("courses"), value: data.data?.courses ?? 0, icon: "book", tone: "info" },
          { label: t("aiRequests"), value: data.data?.aiRequests ?? 0, icon: "sparkle", tone: "accent" },
          { label: t("blockedUsers"), value: data.data?.blockedUsers ?? 0, icon: "shield", tone: "danger" }
        ]}
      />
      <Section title={t("quickActions")}>
        <div className="course-grid">
          <Link className="value-card" to="/admin/users"><div className="value-icon"><Icon name="users" /></div><h3>{t("users")}</h3><p className="muted">{t("adminUsersDesc")}</p></Link>
          <Link className="value-card" to="/admin/courses"><div className="value-icon"><Icon name="book" /></div><h3>{t("courses")}</h3><p className="muted">{t("adminCoursesDesc")}</p></Link>
          <Link className="value-card" to="/admin/audit-logs"><div className="value-icon"><Icon name="shield" /></div><h3>{t("auditLogs")}</h3><p className="muted">{t("adminAuditDesc")}</p></Link>
          <Link className="value-card" to="/admin/ai-history"><div className="value-icon"><Icon name="robot" /></div><h3>{t("aiHistory")}</h3><p className="muted">{t("adminAiHistoryDesc")}</p></Link>
        </div>
      </Section>
      <Section title={t("recentAuditLog")} empty={recent.length === 0} emptyText={t("auditLogsEmpty")}>
        <DataTable
          columns={[t("action"), t("entity"), t("actor"), t("when")]}
          rows={recent.slice(0, 10).map((log) => [
            <span key="a" className="badge info">{auditActionLabel(log.action)}</span>,
            <span key="e">{entityTypeLabel(log.entityType)}</span>,
            <span key="ac">{log.actor?.fullName ?? "—"}</span>,
            <span key="t" className="muted">{new Date(log.createdAt).toLocaleString()}</span>
          ])}
        />
      </Section>
    </Page>
  );
}

function CoursesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const courses = useQuery({ queryKey: ["courses", search], queryFn: () => api<Paginated<Course>>(`/courses?search=${encodeURIComponent(search)}`) });
  return (
    <Page title={t("courses")} subtitle={t("coursesSubtitle")}>
      <label className="search">{t("search")}<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} /></label>
      <Section title={`${courses.data?.items.length ?? 0} ${t("courses")}`} empty={!courses.isLoading && !courses.data?.items.length} emptyText={t("noCourses")}>
        {courses.isLoading ? <Status text={t("loading")} /> : (
          <div className="course-grid">
            {courses.data?.items.map((course) => <CourseCard key={course.id} course={course} href={`/courses/${course.id}`} />)}
          </div>
        )}
      </Section>
    </Page>
  );
}

function CourseDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const course = useQuery({ queryKey: ["course", id], queryFn: () => api<CourseDetail>(`/courses/${id}`), enabled: Boolean(id) });
  const enroll = useMutation({
    mutationFn: () => api("/enrollments", { method: "POST", body: JSON.stringify({ courseId: id }) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      void queryClient.invalidateQueries({ queryKey: ["course", id] });
    }
  });
  const c = course.data;
  const progress = c?.studentProgress;
  const score = c?.scoreSummary;
  return (
    <Page title={text(c, "title") || t("courses")}>
      <p className="lead">{text(c, "description") || t("translationMissing")}</p>
      <MetricGrid
        items={[
          { label: t("materials"), value: c?.contentSummary?.materialCount ?? c?.materials?.length ?? 0, icon: "book" },
          { label: t("tests"), value: c?.contentSummary?.testCount ?? c?.tests?.length ?? 0, icon: "check", tone: "info" },
          { label: t("progress"), value: `${Math.round(progress?.percent ?? 0)}%`, icon: "chart", tone: "accent" },
          { label: t("avgScore"), value: score?.latestAverageScore ?? "—", icon: "sparkle" }
        ]}
      />
      {getRole() === "STUDENT" && (
        <div className="quick-actions">
          {!c?.studentEnrollment && <button type="button" onClick={() => enroll.mutate()}>{t("enroll")}</button>}
          <Link className="primary-link" to={`/progress/${id}`}><Icon name="chart" /> {t("progress")}</Link>
          <Link className="ghost-link" to="/ai"><Icon name="sparkle" /> {t("aiAssistant")}</Link>
        </div>
      )}
      <Section title={t("materials")} empty={!c?.materials?.length} emptyText={t("noMaterials")}>
        {c?.materials?.map((material) => (
          <Link className="row" key={material.id} to={`/materials/${material.id}`}>
            <span>{text(material, "title")}</span>
            <span className="meta">#{material.orderIndex} · {materialTypeLabel(material.type)}</span>
          </Link>
        ))}
      </Section>
      <Section title={t("tests")} empty={!c?.tests?.length} emptyText={t("noTests")}>
        {c?.tests?.map((test) => (
          <Link className="row" key={test.id} to={`/tests/${test.id}`}>
            <span>{text(test, "title")}</span>
            <span className="meta">{test.questions.length} {t("questions")} · {t("pass")} {test.passScore}%</span>
          </Link>
        ))}
      </Section>
    </Page>
  );
}

function MyCoursesPage() {
  const { t } = useTranslation();
  const data = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => api<Array<{ course: Course; status: string; progress?: CourseProgress | null; scoreSummary?: ScoreSummary }>>("/enrollments/my")
  });
  return (
    <Page title={t("myCourses")} subtitle={t("myCoursesSubtitle")}>
      <Section title={`${data.data?.length ?? 0} ${t("myCourses")}`} empty={!data.isLoading && !data.data?.length} emptyText={t("noCourses")}>
        <div className="course-grid">
          {data.data?.map((item) => (
            <CourseCard
              key={item.course.id}
              course={{ ...item.course, percent: item.progress?.percent, scoreSummary: item.scoreSummary }}
              href={`/courses/${item.course.id}`}
            />
          ))}
        </div>
      </Section>
    </Page>
  );
}

function MaterialPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const material = useQuery({
    queryKey: ["material", id],
    queryFn: () => api<Course & { contentRu?: string; contentKz?: string; courseId: string; type?: string; fileUrl?: string | null; videoUrl?: string | null }>(`/materials/${id}`),
    enabled: Boolean(id)
  });
  const complete = useMutation({ mutationFn: () => api(`/materials/${id}/complete`, { method: "POST" }) });
  const body = i18n.language === "kz" ? material.data?.contentKz || material.data?.contentRu : material.data?.contentRu || material.data?.contentKz;
  return (
    <Page title={text(material.data, "title") || t("material")}>
      {body && <article className="reading">{body}</article>}
      {(material.data?.fileUrl || material.data?.videoUrl) && (
        <div className="quick-actions">
          {material.data.fileUrl && <a className="primary-link" href={material.data.fileUrl} target="_blank" rel="noreferrer"><Icon name="cloud" /> {t("openFile")}</a>}
          {material.data.videoUrl && <a className="ghost-link" href={material.data.videoUrl} target="_blank" rel="noreferrer"><Icon name="arrow-right" /> {t("openVideo")}</a>}
        </div>
      )}
      {getRole() === "STUDENT" && <button type="button" onClick={() => complete.mutate()}>{t("complete")}</button>}
      {complete.isSuccess && <p className="success">{t("done")}</p>}
    </Page>
  );
}

type TestQuestion = {
  id: string;
  type?: "SINGLE" | "MULTIPLE" | "TEXT";
  questionTextRu: string;
  questionTextKz: string;
  options: Array<{ key: string; textRu: string; textKz: string }>;
};

function TestPage() {
  const { testId } = useParams();
  const { t } = useTranslation();
  const test = useQuery({
    queryKey: ["test", testId],
    queryFn: () => api<{ titleRu?: string; titleKz?: string; courseId?: string; questions: TestQuestion[] }>(`/tests/${testId}`),
    enabled: Boolean(testId)
  });
  const [single, setSingle] = useState<Record<string, string>>({});
  const [multi, setMulti] = useState<Record<string, string[]>>({});

  function toggleMulti(qid: string, key: string) {
    setMulti((prev) => {
      const current = prev[qid] ? [...prev[qid]] : [];
      const idx = current.indexOf(key);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(key);
      return { ...prev, [qid]: current };
    });
  }

  const submit = useMutation<{ score: number; passed: boolean }>({
    mutationFn: () => {
      const answers = (test.data?.questions ?? []).map((q) => {
        if (q.type === "MULTIPLE") {
          const picked = (multi[q.id] || []).slice().sort().join(",");
          return { questionId: q.id, answer: picked };
        }
        return { questionId: q.id, answer: single[q.id] || "" };
      });
      return api(`/tests/${testId}/submit`, { method: "POST", body: JSON.stringify({ answers }) });
    }
  });

  return (
    <Page title={text(test.data, "title") || t("test")}>
      <form
        className="form wide"
        onSubmit={(event) => {
          event.preventDefault();
          submit.mutate();
        }}
      >
        {test.data?.questions.map((question) => (
          <fieldset key={question.id}>
            <legend>{i18n.language === "kz" ? question.questionTextKz : question.questionTextRu}</legend>
            {question.type === "TEXT" ? (
              <label className="option">
                <input
                  type="text"
                  placeholder={t("answerPlaceholder")}
                  value={single[question.id] || ""}
                  onChange={(e) => setSingle({ ...single, [question.id]: e.target.value })}
                />
              </label>
            ) : (
              question.options.map((option) =>
                question.type === "MULTIPLE" ? (
                  <label key={option.key} className="option">
                    <input
                      type="checkbox"
                      name={question.id}
                      value={option.key}
                      checked={(multi[question.id] || []).includes(option.key)}
                      onChange={() => toggleMulti(question.id, option.key)}
                    />
                    {i18n.language === "kz" ? option.textKz : option.textRu}
                  </label>
                ) : (
                  <label key={option.key} className="option">
                    <input
                      type="radio"
                      name={question.id}
                      value={option.key}
                      onChange={() => setSingle({ ...single, [question.id]: option.key })}
                    />
                    {i18n.language === "kz" ? option.textKz : option.textRu}
                  </label>
                )
              )
            )}
          </fieldset>
        ))}
        <button type="submit">{t("submit")}</button>
      </form>
      {submit.data && (
        <div className={submit.data.passed ? "success" : "error"}>
          {t("score")}: {submit.data.score}% · {submit.data.passed ? t("passed") : t("notPassed")}
        </div>
      )}
      {submit.data && test.data?.courseId && <Link className="ghost-link" to={`/courses/${test.data.courseId}`}>{t("backToCourse")}</Link>}
    </Page>
  );
}

function ProgressBars({ items }: { items: Array<{ label: string; value: number }> }) {
  if (!items.length) return null;
  const barHeight = 22;
  const gap = 6;
  const width = 480;
  const labelWidth = 160;
  const trackWidth = width - labelWidth - 60;
  return (
    <svg
      role="img"
      aria-label="progress chart"
      width={width}
      height={items.length * (barHeight + gap)}
    >
      {items.map((item, idx) => {
        const y = idx * (barHeight + gap);
        const w = Math.max(2, (item.value / 100) * trackWidth);
        return (
          <g key={item.label}>
            <text x={0} y={y + barHeight - 6} fontSize={12}>{item.label}</text>
            <rect x={labelWidth} y={y} width={trackWidth} height={barHeight} fill="#e2f2ef" rx={4} />
            <rect x={labelWidth} y={y} width={w} height={barHeight} fill="#0f766e" rx={4} />
            <text x={labelWidth + trackWidth + 8} y={y + barHeight - 6} fontSize={12}>{Math.round(item.value)}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function ProgressPage() {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const progress = useQuery({
    queryKey: ["progress", courseId],
    queryFn: () =>
      api<CourseProgress>(`/progress/${courseId}`),
    enabled: Boolean(courseId)
  });
  const data = progress.data;
  const items = data
    ? [
        {
          label: t("materials"),
          value: data.totalMaterials > 0 ? (data.completedMaterials / data.totalMaterials) * 100 : 0
        },
        {
          label: t("tests"),
          value: data.totalTests > 0 ? (data.passedTests / data.totalTests) * 100 : 0
        },
        { label: t("overall"), value: data.percent }
      ]
    : [];
  return (
    <Page title={t("progress")}>
      <MetricRow
        items={[
          [t("overall"), `${Math.round(data?.percent ?? 0)}%`],
          [t("materials"), `${data?.completedMaterials ?? 0}/${data?.totalMaterials ?? 0}`],
          [t("tests"), `${data?.passedTests ?? 0}/${data?.totalTests ?? 0}`],
          [t("avgScore"), data?.scoreSummary?.latestAverageScore ?? "—"]
        ]}
      />
      <Section title={t("progress")} empty={!items.length} emptyText={t("noData")}>
        <ProgressBars items={items} />
      </Section>
    </Page>
  );
}

type ChatMessage = { role: "user" | "assistant"; text: string; model?: string; cached?: boolean };

type CourseLite = { id: string; titleRu?: string | null; titleKz?: string | null; status?: string };

type MaterialLite = { id: string; titleRu?: string | null; titleKz?: string | null };

function useAvailableCourses() {
  const role = getRole();
  return useQuery({
    queryKey: ["ai-courses", role],
    queryFn: async () => {
      if (role === "STUDENT") {
        const enrolled = await api<Array<{ course: CourseLite }>>("/enrollments/my");
        return enrolled.map((e) => e.course).filter(Boolean);
      }
      const page = await api<Paginated<CourseLite>>(role === "TEACHER" ? "/teacher/courses?limit=100" : "/courses?limit=100");
      return page.items;
    }
  });
}

function AiPage() {
  const { t } = useTranslation();
  const courses = useAvailableCourses();
  const [courseId, setCourseId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const materials = useQuery({
    queryKey: ["ai-materials", courseId],
    queryFn: () => api<MaterialLite[]>(`/courses/${courseId}/materials`),
    enabled: Boolean(courseId)
  });

  async function send(path: string, body: string) {
    if (!courseId || !body.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: body }]);
    try {
      const data = await api<{ answer: string; model: string; cached?: boolean }>(path, {
        method: "POST",
        body: JSON.stringify({
          courseId,
          materialId: materialId || undefined,
          message: body,
          language: i18n.language
        })
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, model: data.model, cached: data.cached }]);
    } catch (err) {
      const text = err instanceof Error ? err.message : t("aiUnavailable");
      setMessages((prev) => [...prev, { role: "assistant", text, model: "error" }]);
    }
  }

  return (
    <Page title={t("aiAssistant")}>
      <div className="form wide">
        <label>
          {t("aiSelectCourse")}
          <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setMaterialId(""); }} required>
            <option value="">—</option>
            {courses.data?.map((c) => (
              <option key={c.id} value={c.id}>{text(c, "title") || c.id}</option>
            ))}
          </select>
        </label>
        <label>
          {t("aiSelectMaterial")}
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} disabled={!courseId}>
            <option value="">—</option>
            {materials.data?.map((m) => (
              <option key={m.id} value={m.id}>{text(m, "title") || m.id}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="chat" aria-live="polite">
        {messages.length === 0 && <p className="muted">{t("aiPlaceholder")}</p>}
        {messages.map((m, idx) => (
          <article key={idx} className={`chat-bubble ${m.role}`}>
            {m.model && <strong>{m.model}{m.cached ? ` · ${t("cached")}` : ""}</strong>}
            <p>{m.text}</p>
          </article>
        ))}
      </div>

      <form
        className="form wide"
        onSubmit={(event) => {
          event.preventDefault();
          const body = message;
          setMessage("");
          void send("/ai/chat", body);
        }}
      >
        <label>
          {t("aiPlaceholder")}
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (courseId && message.trim().length >= 2) {
                  const body = message;
                  setMessage("");
                  void send("/ai/chat", body);
                }
              }
            }}
            minLength={2} 
            required 
          />
        </label>
        <div className="quick-actions">
          <button type="submit" disabled={!courseId}>{t("send")}</button>
          <button type="button" className="ghost" disabled={!courseId || !message} onClick={() => { const m = message; setMessage(""); void send("/ai/summarize-material", m); }}>{t("aiSummarize")}</button>
          <button type="button" className="ghost" disabled={!courseId || !message} onClick={() => { const m = message; setMessage(""); void send("/ai/generate-questions", m); }}>{t("aiQuestions")}</button>
          <button type="button" className="ghost" disabled={!courseId || !message} onClick={() => { const m = message; setMessage(""); void send("/ai/translate", m); }}>{t("aiTranslate")}</button>
        </div>
      </form>
    </Page>
  );
}

type GeneratedTest = {
  titleRu?: string;
  titleKz?: string;
  questions: Array<{
    questionTextRu: string;
    questionTextKz: string;
    type: "SINGLE" | "MULTIPLE";
    options: Array<{ key: string; textRu: string; textKz: string }>;
    correctAnswer: string;
    points: number;
  }>;
  model?: string;
  cached?: boolean;
};

function TeacherTestGenPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [count, setCount] = useState(5);
  const [questionType, setQuestionType] = useState<"SINGLE" | "MULTIPLE" | "MIXED">("SINGLE");
  const [topic, setTopic] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [preview, setPreview] = useState<GeneratedTest | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const materials = useQuery({
    queryKey: ["materials", id],
    queryFn: () => api<MaterialLite[]>(`/courses/${id}/materials`),
    enabled: Boolean(id)
  });

  const generate = useMutation({
    mutationFn: () =>
      api<GeneratedTest>("/ai/teacher/generate-test", {
        method: "POST",
        body: JSON.stringify({
          courseId: id,
          materialId: materialId || undefined,
          count,
          language: i18n.language,
          questionType,
          topic: topic || undefined
        })
      }),
    onSuccess: (data) => setPreview(data)
  });

  async function persist() {
    if (!preview || !id) return;
    setSaveMessage("");
    const test = await api<{ id: string }>(`/courses/${id}/tests`, {
      method: "POST",
      body: JSON.stringify({
        titleRu: preview.titleRu || "ИИ-тест",
        titleKz: preview.titleKz || "ЖИ тест",
        durationMinutes: 30,
        passScore: 70
      })
    });
    for (const q of preview.questions) {
      await api(`/tests/${test.id}/questions`, {
        method: "POST",
        body: JSON.stringify({
          questionTextRu: q.questionTextRu,
          questionTextKz: q.questionTextKz,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points
        })
      });
    }
    setSaveMessage(t("saved"));
  }

  return (
    <Page title={t("teacherTestGen")}>
      <form
        className="form wide"
        onSubmit={(event) => {
          event.preventDefault();
          generate.mutate();
        }}
      >
        <label>
          {t("aiSelectMaterial")}
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
            <option value="">—</option>
            {materials.data?.map((m) => (
              <option key={m.id} value={m.id}>{text(m, "title") || m.id}</option>
            ))}
          </select>
        </label>
        <label>
          {t("count")}
          <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <label>
          {t("questionType")}
          <select value={questionType} onChange={(e) => setQuestionType(e.target.value as typeof questionType)}>
            <option value="SINGLE">{t("singleChoice")}</option>
            <option value="MULTIPLE">{t("multipleChoice")}</option>
            <option value="MIXED">{t("questionTypeMixed")}</option>
          </select>
        </label>
        <label>
          {t("topic")}
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} />
        </label>
        <button type="submit">{t("generateTest")}</button>
      </form>

      {generate.isPending && <Status text={t("loading")} />}
      {generate.isError && <p className="error">{generate.error instanceof Error ? generate.error.message : t("aiUnavailable")}</p>}

      {preview && (
        <Section title={preview.titleRu || preview.titleKz || t("aiTest")} empty={!preview.questions.length} emptyText={t("noTests")}>
          {preview.questions.map((q, idx) => (
            <div className="row" key={idx} style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <strong>{idx + 1}. {i18n.language === "kz" ? q.questionTextKz : q.questionTextRu}</strong>
              <ul>
                {q.options.map((o) => (
                  <li key={o.key}>{o.key}. {i18n.language === "kz" ? o.textKz : o.textRu}</li>
                ))}
              </ul>
              <span className="muted">{questionTypeLabel(q.type)} · ✓ {q.correctAnswer}</span>
            </div>
          ))}
          <button type="button" onClick={persist}>{t("saveAsTest")}</button>
          {saveMessage && <p className="success">{saveMessage}</p>}
        </Section>
      )}
    </Page>
  );
}

function NotificationsPage() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["notifications"], queryFn: () => api<Paginated<{ id: string; titleRu: string; titleKz: string; messageRu: string; messageKz: string }>>("/notifications") });
  return <Page title={t("notifications")}><Section title={t("notifications")} empty={!data.isLoading && !data.data?.items.length} emptyText={t("noNotifications")}>{data.data?.items.map((n) => <div className="row" key={n.id}><strong>{i18n.language === "kz" ? n.titleKz : n.titleRu}</strong><span>{i18n.language === "kz" ? n.messageKz : n.messageRu}</span></div>)}</Section></Page>;
}

function TeacherCoursesPage() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["teacher-courses"], queryFn: () => api<Paginated<Course>>("/teacher/courses?limit=100") });
  return (
    <Page
      title={t("courses")}
      subtitle={t("teacherCoursesSubtitle")}
      actions={<Link className="primary-link" to="/teacher/courses/create"><Icon name="plus" /> {t("createCourse")}</Link>}
    >
      <Section title={`${data.data?.items.length ?? 0} ${t("courses")}`} empty={!data.isLoading && !data.data?.items.length} emptyText={t("noCourses")}>
        <div className="course-grid">
          {data.data?.items.map((course) => <CourseCard key={course.id} course={course} href={`/teacher/courses/${course.id}/edit`} />)}
        </div>
      </Section>
    </Page>
  );
}

function CourseFormPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ titleRu: "", titleKz: "", descriptionRu: "", descriptionKz: "", categoryId: "", price: 0 });
  const course = useQuery({ queryKey: ["course", id], queryFn: () => api<CourseDetail>(`/courses/${id}`), enabled: Boolean(id) });
  const categories = useQuery({ queryKey: ["categories"], queryFn: () => api<Array<{ id: string; nameRu: string; nameKz: string }>>("/categories") });
  useEffect(() => {
    if (!course.data) return;
    setForm({
      titleRu: course.data.titleRu ?? "",
      titleKz: course.data.titleKz ?? "",
      descriptionRu: course.data.descriptionRu ?? "",
      descriptionKz: course.data.descriptionKz ?? "",
      categoryId: course.data.categoryId ?? "",
      price: course.data.price ?? 0
    });
  }, [course.data]);
  const save = useMutation({
    mutationFn: () => api<Course>(id ? `/courses/${id}` : "/courses", { method: id ? "PUT" : "POST", body: JSON.stringify(form) }),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      if (!id) navigate(`/teacher/courses/${saved.id}/edit`);
      else void queryClient.invalidateQueries({ queryKey: ["course", id] });
    }
  });
  const publish = useMutation({
    mutationFn: () => api(`/courses/${id}/publish`, { method: "PUT" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["course", id] });
      void queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    }
  });
  const c = course.data;
  return (
    <Page
      title={id ? text(c, "title") || t("courseWorkspace") : t("createCourse")}
      subtitle={id ? t("courseSetupSubtitle") : undefined}
      actions={id && c?.status === "DRAFT" ? <button type="button" onClick={() => publish.mutate()}>{t("publish")}</button> : undefined}
    >
      {id && <CourseWorkspaceNav courseId={id} />}
      {id && c && (
        <MetricGrid
          items={[
            { label: t("materials"), value: c.contentSummary?.materialCount ?? 0, icon: "book" },
            { label: t("tests"), value: c.contentSummary?.testCount ?? 0, icon: "check", tone: "info" },
            { label: t("students"), value: c.managementSummary?.enrollmentCount ?? 0, icon: "users" },
            { label: t("avgProgress"), value: `${Math.round(c.managementSummary?.averageProgress ?? 0)}%`, icon: "chart", tone: "accent" }
          ]}
        />
      )}
      <form className="form wide" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        <label>{t("titleRu")}<input value={form.titleRu} onChange={(e) => setForm({ ...form, titleRu: e.target.value })} /></label>
        <label>{t("titleKz")}<input value={form.titleKz} onChange={(e) => setForm({ ...form, titleKz: e.target.value })} /></label>
        <label>{t("descriptionRu")}<textarea value={form.descriptionRu} onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })} /></label>
        <label>{t("descriptionKz")}<textarea value={form.descriptionKz} onChange={(e) => setForm({ ...form, descriptionKz: e.target.value })} /></label>
        <label>
          {t("category")}
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">—</option>
            {categories.data?.map((category) => <option key={category.id} value={category.id}>{i18n.language === "kz" ? category.nameKz : category.nameRu}</option>)}
          </select>
        </label>
        <label>{t("price")}<input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
        <button type="submit">{t("save")}</button>
        {save.isSuccess && <p className="success">{t("saved")}</p>}
      </form>
    </Page>
  );
}

function TeacherMaterialsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const emptyForm = { titleRu: "", titleKz: "", type: "TEXT", contentRu: "", contentKz: "", fileUrl: "", videoUrl: "", orderIndex: 1 };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const data = useQuery({
    queryKey: ["materials", id],
    queryFn: () => api<Array<{ id: string; titleRu?: string; titleKz?: string; type: string; contentRu?: string | null; contentKz?: string | null; fileUrl?: string | null; videoUrl?: string | null; orderIndex: number }>>(`/courses/${id}/materials`),
    enabled: Boolean(id)
  });
  const save = useMutation({
    mutationFn: () => api(editingId ? `/materials/${editingId}` : `/courses/${id}/materials`, { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) }),
    onSuccess: () => {
      setEditingId(null);
      setForm(emptyForm);
      void queryClient.invalidateQueries({ queryKey: ["materials", id] });
      void queryClient.invalidateQueries({ queryKey: ["course", id] });
    }
  });
  const upload = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return api<{ fileUrl: string }>("/files/upload", { method: "POST", body });
    },
    onSuccess: (file) => setForm((current) => ({ ...current, fileUrl: file.fileUrl }))
  });
  return (
    <Page title={t("materials")}>
      {id && <CourseWorkspaceNav courseId={id} />}
      <form className="form wide" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        <label>{t("titleRu")}<input value={form.titleRu} onChange={(e) => setForm({ ...form, titleRu: e.target.value })} /></label>
        <label>{t("titleKz")}<input value={form.titleKz} onChange={(e) => setForm({ ...form, titleKz: e.target.value })} /></label>
        <label>{t("type")}<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="TEXT">{t("materialTypeText")}</option><option value="PDF">{t("materialTypePdf")}</option><option value="VIDEO_URL">{t("materialTypeVideoUrl")}</option><option value="FILE">{t("materialTypeFile")}</option></select></label>
        {form.type === "TEXT" && (
          <>
            <label>{t("contentRu")}<textarea value={form.contentRu} onChange={(e) => setForm({ ...form, contentRu: e.target.value })} /></label>
            <label>{t("contentKz")}<textarea value={form.contentKz} onChange={(e) => setForm({ ...form, contentKz: e.target.value })} /></label>
          </>
        )}
        {(form.type === "PDF" || form.type === "FILE") && (
          <>
            <label>{t("fileUrl")}<input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /></label>
            <label>{t("uploadPdfOrImage")}<input type="file" accept=".pdf,image/png,image/jpeg" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload.mutate(file); }} /></label>
          </>
        )}
        {form.type === "VIDEO_URL" && <label>{t("videoUrl")}<input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} /></label>}
        <label>{t("order")}<input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })} /></label>
        <div className="quick-actions">
          <button type="submit">{t("save")}</button>
          {editingId && <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>{t("cancel")}</button>}
        </div>
      </form>
      <Section title={t("materials")} empty={!data.isLoading && !data.data?.length} emptyText={t("noMaterials")}>
        {data.data?.map((material) => (
          <div className="row" key={material.id}>
            <div>
              <strong>{text(material, "title")}</strong>
              <div className="meta">#{material.orderIndex} · {materialTypeLabel(material.type)}{material.fileUrl ? ` · ${t("file")}` : ""}{material.videoUrl ? ` · ${t("video")}` : ""}</div>
            </div>
            <button
              type="button"
              className="ghost compact"
              onClick={() => {
                setEditingId(material.id);
                setForm({
                  titleRu: material.titleRu ?? "",
                  titleKz: material.titleKz ?? "",
                  type: material.type,
                  contentRu: material.contentRu ?? "",
                  contentKz: material.contentKz ?? "",
                  fileUrl: material.fileUrl ?? "",
                  videoUrl: material.videoUrl ?? "",
                  orderIndex: material.orderIndex
                });
              }}
            >
              {t("edit")}
            </button>
          </div>
        ))}
      </Section>
    </Page>
  );
}

function TeacherTestsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [testForm, setTestForm] = useState({ titleRu: "", titleKz: "", durationMinutes: 30, passScore: 70 });
  const [selectedTestId, setSelectedTestId] = useState("");
  const emptyOption = () => ({ key: "", textRu: "", textKz: "" });
  const [questionForm, setQuestionForm] = useState({
    questionTextRu: "",
    questionTextKz: "",
    type: "SINGLE" as "SINGLE" | "MULTIPLE" | "TEXT",
    correctAnswer: "",
    points: 1,
    options: [
      { key: "A", textRu: "", textKz: "" },
      { key: "B", textRu: "", textKz: "" }
    ] as Array<{ key: string; textRu: string; textKz: string }>
  });

  function addOption() {
    const nextKey = String.fromCharCode(65 + questionForm.options.length);
    setQuestionForm((prev) => ({ ...prev, options: [...prev.options, { key: nextKey, textRu: "", textKz: "" }] }));
  }

  function removeOption(idx: number) {
    setQuestionForm((prev) => {
      const updated = prev.options.filter((_, i) => i !== idx).map((opt, i) => ({ ...opt, key: String.fromCharCode(65 + i) }));
      return { ...prev, options: updated, correctAnswer: "" };
    });
  }

  function updateOption(idx: number, field: "textRu" | "textKz", value: string) {
    setQuestionForm((prev) => {
      const updated = [...prev.options];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, options: updated };
    });
  }

  const data = useQuery({
    queryKey: ["tests", id],
    queryFn: () => api<Array<{ id: string; titleRu?: string; titleKz?: string; durationMinutes: number; passScore: number; questions: TestQuestion[] }>>(`/courses/${id}/tests`),
    enabled: Boolean(id)
  });
  useEffect(() => {
    if (!selectedTestId && data.data?.[0]) setSelectedTestId(data.data[0].id);
  }, [data.data, selectedTestId]);
  const createTest = useMutation<{ id: string }>({
    mutationFn: () => api<{ id: string }>(`/courses/${id}/tests`, { method: "POST", body: JSON.stringify(testForm) }),
    onSuccess: (created: { id: string }) => {
      setSelectedTestId(created.id);
      void queryClient.invalidateQueries({ queryKey: ["tests", id] });
      void queryClient.invalidateQueries({ queryKey: ["course", id] });
    }
  });
  const createQuestion = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        questionTextRu: questionForm.questionTextRu,
        questionTextKz: questionForm.questionTextKz,
        type: questionForm.type,
        correctAnswer: questionForm.correctAnswer,
        points: questionForm.points
      };
      if (questionForm.type !== "TEXT") {
        payload.options = questionForm.options;
      }
      return api(`/tests/${selectedTestId}/questions`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      setQuestionForm({
        questionTextRu: "", questionTextKz: "",
        type: "SINGLE", correctAnswer: "", points: 1,
        options: [{ key: "A", textRu: "", textKz: "" }, { key: "B", textRu: "", textKz: "" }]
      });
      void queryClient.invalidateQueries({ queryKey: ["tests", id] });
      void queryClient.invalidateQueries({ queryKey: ["course", id] });
    }
  });
  return (
    <Page title={t("tests")} actions={<Link className="primary-link" to={`/teacher/courses/${id}/ai-test-gen`}>{t("teacherTestGen")}</Link>}>
      {id && <CourseWorkspaceNav courseId={id} />}
      <form className="form wide" onSubmit={(event) => { event.preventDefault(); createTest.mutate(); }}>
        <label>{t("titleRu")}<input value={testForm.titleRu} onChange={(e) => setTestForm({ ...testForm, titleRu: e.target.value })} /></label>
        <label>{t("titleKz")}<input value={testForm.titleKz} onChange={(e) => setTestForm({ ...testForm, titleKz: e.target.value })} /></label>
        <label>{t("duration")}<input type="number" value={testForm.durationMinutes} onChange={(e) => setTestForm({ ...testForm, durationMinutes: Number(e.target.value) })} /></label>
        <label>{t("passScore")}<input type="number" value={testForm.passScore} onChange={(e) => setTestForm({ ...testForm, passScore: Number(e.target.value) })} /></label>
        <button type="submit">{t("save")}</button>
      </form>
      <Section title={t("tests")} empty={!data.isLoading && !data.data?.length} emptyText={t("noTests")}>
        {data.data?.map((test) => (
          <div className="row" key={test.id}>
            <div>
              <strong>{text(test, "title")}</strong>
              <div className="meta">{test.questions.length} {t("questions")} · {test.durationMinutes} {t("minutes")} · {t("pass")} {test.passScore}%</div>
            </div>
            <button type="button" className="ghost compact" onClick={() => setSelectedTestId(test.id)}>
              {selectedTestId === test.id ? t("selected") : t("select")}
            </button>
          </div>
        ))}
      </Section>
      <form className="form wide" onSubmit={(event) => { event.preventDefault(); createQuestion.mutate(); }}>
        <h2>{t("question")}</h2>
        <label>
          {t("test")}
          <select value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)} required>
            <option value="">—</option>
            {data.data?.map((test) => <option key={test.id} value={test.id}>{text(test, "title") || test.id}</option>)}
          </select>
        </label>
        <label>
          {t("questionType")}
          <select value={questionForm.type} onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as typeof questionForm.type, correctAnswer: "" })}>
            <option value="SINGLE">{t("singleChoice")}</option>
            <option value="MULTIPLE">{t("multipleChoice")}</option>
            <option value="TEXT">{t("questionTypeText")}</option>
          </select>
        </label>
        <label>{`${t("question")} (RU)`}<input value={questionForm.questionTextRu} onChange={(e) => setQuestionForm({ ...questionForm, questionTextRu: e.target.value })} required /></label>
        <label>{`${t("question")} (KZ)`}<input value={questionForm.questionTextKz} onChange={(e) => setQuestionForm({ ...questionForm, questionTextKz: e.target.value })} required /></label>
        {questionForm.type !== "TEXT" && (
          <>
            <h3>{t("options")}</h3>
            {questionForm.options.map((opt, idx) => (
              <div key={opt.key} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <strong style={{ minWidth: 24 }}>{opt.key}</strong>
                <label style={{ flex: 1 }}>{`${t("option")} (RU)`}<input value={opt.textRu} onChange={(e) => updateOption(idx, "textRu", e.target.value)} required /></label>
                <label style={{ flex: 1 }}>{`${t("option")} (KZ)`}<input value={opt.textKz} onChange={(e) => updateOption(idx, "textKz", e.target.value)} required /></label>
                {questionForm.options.length > 2 && (
                  <button type="button" className="ghost compact" onClick={() => removeOption(idx)}>✕</button>
                )}
              </div>
            ))}
            {questionForm.options.length < 8 && (
              <button type="button" className="ghost" onClick={addOption}>{t("addOption")}</button>
            )}
            <label>
              {t("correctAnswer")}
              {questionForm.type === "SINGLE" ? (
                <select value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} required>
                  <option value="">—</option>
                  {questionForm.options.map((opt) => <option key={opt.key} value={opt.key}>{opt.key}</option>)}
                </select>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {questionForm.options.map((opt) => {
                    const selected = questionForm.correctAnswer.split(",").includes(opt.key);
                    return (
                      <label key={opt.key} className="option">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const keys = questionForm.correctAnswer.split(",").filter(Boolean);
                            const next = selected ? keys.filter((k) => k !== opt.key) : [...keys, opt.key];
                            setQuestionForm({ ...questionForm, correctAnswer: next.sort().join(",") });
                          }}
                        />
                        {opt.key}
                      </label>
                    );
                  })}
                </div>
              )}
            </label>
          </>
        )}
        {questionForm.type === "TEXT" && (
          <label>{t("correctAnswerText")}<input value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} required /></label>
        )}
        <label>{t("points")}<input type="number" min={1} value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: Number(e.target.value) })} /></label>
        <button type="submit">{t("save")}</button>
        {createQuestion.isError && <p className="error">{createQuestion.error instanceof Error ? createQuestion.error.message : t("error")}</p>}
        {createQuestion.isSuccess && <p className="success">{t("saved")}</p>}
      </form>
    </Page>
  );
}

function TeacherStudentsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const data = useQuery({
    queryKey: ["students", id],
    queryFn: () => api<Paginated<{ student: { fullName: string; email: string }; progress?: CourseProgress | null; scoreSummary?: ScoreSummary }>>(`/courses/${id}/students`),
    enabled: Boolean(id)
  });

  const handleDownloadPdf = () => {
    const element = document.getElementById("students-report");
    if (!element) return;
    const opt = {
      margin:       10,
      filename:     `Report_Course_${id}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <Page 
      title={t("students")}
      actions={
        <button type="button" className="ghost" onClick={handleDownloadPdf} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="cloud" /> {t("downloadFile")} (PDF)
        </button>
      }
    >
      {id && <CourseWorkspaceNav courseId={id} />}
      <Section title={t("students")} empty={!data.isLoading && !data.data?.items.length} emptyText={t("noStudents")}>
        <div id="students-report" style={{ padding: '10px', background: 'white', color: 'black' }}>
          <h2>{t("studentsReportTitle", { id })}</h2>
          <DataTable
            columns={[t("student"), t("email"), t("progress"), t("avgScore"), t("bestScore")]}
            rows={(data.data?.items ?? []).map((item) => [
              <strong key="n">{item.student.fullName}</strong>,
              <span key="e" className="muted">{item.student.email}</span>,
              <span key="p">{Math.round(item.progress?.percent ?? 0)}%</span>,
              <span key="a">{item.scoreSummary?.latestAverageScore ?? "—"}</span>,
              <span key="b">{item.scoreSummary?.bestScore ?? "—"}</span>
            ])}
          />
        </div>
      </Section>
    </Page>
  );
}

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
};

function AdminUsersPage() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["/admin/users"], queryFn: () => api<Paginated<AdminUser>>("/admin/users") });
  return (
    <Page title={t("users")} subtitle={t("usersSubtitle")}>
      <Section title={`${data.data?.meta.total ?? 0} ${t("userCount")}`} empty={!data.isLoading && !data.data?.items.length} emptyText={t("noData")}>
        <DataTable
          columns={[t("name"), t("email"), t("role"), t("status"), t("created")]}
          rows={(data.data?.items ?? []).map((u) => [
            <span key="n"><strong>{u.fullName}</strong></span>,
            <span key="e" className="muted">{u.email}</span>,
            <RoleBadge key="r" role={u.role} />,
            <StatusBadge key="s" status={u.status} />,
            <span key="c" className="muted">{new Date(u.createdAt).toLocaleDateString()}</span>
          ])}
        />
      </Section>
    </Page>
  );
}

type AdminCourse = {
  id: string;
  titleRu?: string;
  titleKz?: string;
  status?: string;
  category?: { nameRu?: string; nameKz?: string };
  teacher?: { fullName?: string };
  createdAt?: string;
  contentSummary?: ContentSummary;
};

function AdminCoursesPage() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["/admin/courses"], queryFn: () => api<Paginated<AdminCourse>>("/admin/courses") });
  return (
    <Page title={t("courses")} subtitle={t("adminCoursesSubtitle")}>
      <Section title={`${data.data?.meta.total ?? 0} ${t("courseCount")}`} empty={!data.isLoading && !data.data?.items.length} emptyText={t("noData")}>
        <DataTable
          columns={[t("title"), t("category"), t("teacher"), t("content"), t("students"), t("status"), t("created")]}
          rows={(data.data?.items ?? []).map((c) => [
            <strong key="t">{text(c, "title") || "—"}</strong>,
            <span key="cat" className="muted">{i18n.language === "kz" ? c.category?.nameKz : c.category?.nameRu}</span>,
            <span key="te">{c.teacher?.fullName ?? "—"}</span>,
            <span key="co">{c.contentSummary?.materialCount ?? 0} / {c.contentSummary?.testCount ?? 0}</span>,
            <span key="st">{c.contentSummary?.enrollmentCount ?? 0}</span>,
            <CourseStatusBadge key="s" status={c.status} />,
            <span key="c" className="muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</span>
          ])}
        />
      </Section>
    </Page>
  );
}

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
  actor?: { fullName?: string; email?: string; role?: string };
  metadata?: Record<string, unknown>;
};

function AdminAuditPage() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["/admin/audit-logs"], queryFn: () => api<Paginated<AuditLog>>("/admin/audit-logs") });
  return (
    <Page title={t("auditLogs")} subtitle={t("auditSubtitle")}>
      <Section title={`${data.data?.meta.total ?? 0} ${t("entries")}`} empty={!data.isLoading && !data.data?.items.length} emptyText={t("noData")}>
        <DataTable
          columns={[t("action"), t("entity"), t("actor"), t("when"), t("metadata")]}
          rows={(data.data?.items ?? []).map((log) => [
            <span key="a" className={`badge ${log.action.includes("ERROR") ? "danger" : log.action.includes("DELETE") ? "warn" : "info"}`}>{auditActionLabel(log.action)}</span>,
            <span key="e">{entityTypeLabel(log.entityType)}</span>,
            <span key="ac">{log.actor?.fullName ?? "—"} <span className="muted">{log.actor?.role ? roleBadgeLabel(log.actor.role) : ""}</span></span>,
            <span key="t" className="muted">{new Date(log.createdAt).toLocaleString()}</span>,
            <code key="m" style={{ fontSize: 12, color: "var(--text-soft)" }}>{log.metadata ? JSON.stringify(log.metadata) : "—"}</code>
          ])}
        />
      </Section>
    </Page>
  );
}

type AiHistoryRow = {
  id: string;
  userId: string;
  course?: { titleRu?: string; titleKz?: string };
  message: string;
  answer: string;
  model: string;
  language: string;
  status: string;
  createdAt: string;
};

function AdminAiHistoryPage() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["/admin/ai-history"], queryFn: () => api<Paginated<AiHistoryRow>>("/admin/ai-history") });
  return (
    <Page title={t("aiHistory")} subtitle={t("adminAiHistoryDesc")}>
      <Section title={`${data.data?.meta.total ?? 0} ${t("requests")}`} empty={!data.isLoading && !data.data?.items.length} emptyText={t("noData")}>
        <DataTable
          columns={[t("course"), t("model"), t("status"), t("language"), t("message"), t("when")]}
          rows={(data.data?.items ?? []).map((row) => [
            <span key="c">{text(row.course, "title") || "—"}</span>,
            <span key="m" className="badge info">{row.model}</span>,
            <AiStatusBadge key="s" status={row.status} />,
            <span key="l" className="badge muted">{row.language.toUpperCase()}</span>,
            <span key="msg" style={{ maxWidth: 320, display: "inline-block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.message}</span>,
            <span key="t" className="muted">{new Date(row.createdAt).toLocaleString()}</span>
          ])}
        />
      </Section>
    </Page>
  );
}

function AdminCategoriesPage() {
  const { t } = useTranslation();
  const data = useQuery({ queryKey: ["categories"], queryFn: () => api<Array<{ id: string; nameRu: string; nameKz: string; slug: string }>>("/categories") });
  return (
    <Page title={t("categories")} subtitle={t("categoriesSubtitle")}>
      <Section title={`${data.data?.length ?? 0} ${t("categories")}`} empty={!data.isLoading && !data.data?.length} emptyText={t("noData")}>
        <DataTable
          columns={[t("nameRu"), t("nameKz"), t("slug")]}
          rows={(data.data ?? []).map((item) => [
            <strong key="r">{item.nameRu}</strong>,
            <span key="k">{item.nameKz}</span>,
            <code key="s" style={{ color: "var(--text-soft)" }}>{item.slug}</code>
          ])}
        />
      </Section>
    </Page>
  );
}

function Page({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">QazaqLearn</p>
          <h1>{title}</h1>
          {subtitle && <p className="lead" style={{ marginTop: 6 }}>{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

function Section({ title, children, empty, emptyText }: { title: string; children: ReactNode; empty?: boolean; emptyText?: string }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {empty ? <p className="empty">{emptyText ?? "—"}</p> : <div className="list">{children}</div>}
    </section>
  );
}

function MetricRow({ items }: { items: Array<[string, string | number]> }) {
  return (
    <div className="metrics">
      {items.map(([label, value]) => (
        <div className="metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

type MetricItem = {
  label: string;
  value: string | number;
  icon?: string;
  tone?: "default" | "accent" | "info" | "danger";
};

function MetricGrid({ items }: { items: MetricItem[] }) {
  return (
    <div className="metrics">
      {items.map((item) => (
        <div className={`metric ${item.tone && item.tone !== "default" ? item.tone : ""}`} key={item.label}>
          {item.icon && (
            <span aria-hidden style={{ position: "absolute", top: 18, right: 18, color: "var(--primary)" }}>
              <Icon name={item.icon} />
            </span>
          )}
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function CourseCard({ course, href }: { course: Course; href: string }) {
  const initials = (text(course, "title") || "QL").slice(0, 2).toUpperCase();
  return (
    <Link className="course-card" to={href}>
      <div className="thumb" aria-hidden>{initials}</div>
      <div className="title">{text(course, "title") || "—"}</div>
      <div className="desc">{text(course, "description") || i18n.t("translationMissing")}</div>
      {(course.contentSummary || course.scoreSummary) && (
        <div className="course-card-meta">
          {course.contentSummary && <span>{course.contentSummary.materialCount} {i18n.t("materials")} · {course.contentSummary.testCount} {i18n.t("tests")}</span>}
          {course.scoreSummary?.latestAverageScore !== null && course.scoreSummary?.latestAverageScore !== undefined && <span>{i18n.t("avgScore")} {course.scoreSummary.latestAverageScore}%</span>}
        </div>
      )}
      <div className="course-card-footer">
        <CourseStatusBadge status={course.status} />
        {typeof course.percent === "number" && <span className="muted">{Math.round(course.percent)}%</span>}
      </div>
    </Link>
  );
}

function DataTable({ columns, rows }: { columns: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>{columns.map((c, idx) => <th key={idx}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoleBadge({ role }: { role: "STUDENT" | "TEACHER" | "ADMIN" }) {
  const tone = role === "ADMIN" ? "danger" : role === "TEACHER" ? "warn" : "info";
  return <span className={`badge ${tone}`}>{roleBadgeLabel(role)}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "BLOCKED" ? "danger" : "success";
  return <span className={`badge ${tone}`}>{statusLabel(status)}</span>;
}

function CourseStatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="badge muted">{i18n.t("statusUnknown")}</span>;
  if (status === "PUBLISHED") return <span className="badge success">{i18n.t("statusPublished")}</span>;
  if (status === "DRAFT") return <span className="badge warn">{i18n.t("statusDraft")}</span>;
  if (status === "ARCHIVED") return <span className="badge muted">{i18n.t("statusArchived")}</span>;
  if (status === "DELETED") return <span className="badge danger">{i18n.t("statusDeleted")}</span>;
  return <span className="badge">{statusLabel(status)}</span>;
}

function AiStatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS") return <span className="badge success">{i18n.t("statusSuccess")}</span>;
  if (status === "CACHED") return <span className="badge info">{i18n.t("statusCached")}</span>;
  if (status === "MOCK") return <span className="badge warn">{i18n.t("statusMock")}</span>;
  if (status === "BLOCKED") return <span className="badge danger">{i18n.t("statusBlocked")}</span>;
  return <span className="badge muted">{statusLabel(status)}</span>;
}

function Status({ text }: { text: string }) {
  return <p className="muted" role="status">{text}</p>;
}

function text(item: Partial<Record<string, unknown>> | undefined, field: "title" | "description") {
  if (!item) return "";
  const ru = item[`${field}Ru`] as string | undefined | null;
  const kz = item[`${field}Kz`] as string | undefined | null;
  return i18n.language === "kz" ? kz || ru || "" : ru || kz || "";
}

function roleBadgeLabel(role: string) {
  if (role === "STUDENT") return i18n.t("roleStudent");
  if (role === "TEACHER") return i18n.t("roleTeacher");
  if (role === "ADMIN") return i18n.t("roleAdmin");
  return role;
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return i18n.t("statusActive");
  if (status === "BLOCKED") return i18n.t("statusBlocked");
  if (status === "SUCCESS") return i18n.t("statusSuccess");
  if (status === "CACHED") return i18n.t("statusCached");
  if (status === "MOCK") return i18n.t("statusMock");
  return status;
}

function materialTypeLabel(type: string) {
  if (type === "TEXT") return i18n.t("materialTypeText");
  if (type === "PDF") return i18n.t("materialTypePdf");
  if (type === "VIDEO_URL") return i18n.t("materialTypeVideoUrl");
  if (type === "FILE") return i18n.t("materialTypeFile");
  return type;
}

function questionTypeLabel(type: string) {
  if (type === "SINGLE") return i18n.t("singleChoice");
  if (type === "MULTIPLE") return i18n.t("multipleChoice");
  if (type === "TEXT") return i18n.t("questionTypeText");
  if (type === "MIXED") return i18n.t("questionTypeMixed");
  return type;
}

function entityTypeLabel(entityType: string) {
  if (entityType === "User") return i18n.t("entityUser");
  if (entityType === "Course") return i18n.t("entityCourse");
  if (entityType === "CourseMaterial") return i18n.t("entityCourseMaterial");
  if (entityType === "Test") return i18n.t("entityTest");
  if (entityType === "Category") return i18n.t("entityCategory");
  return entityType;
}

function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    USER_ROLE_CHANGED: "auditActionUserRoleChanged",
    USER_STATUS_CHANGED: "auditActionUserStatusChanged",
    COURSE_CREATED: "auditActionCourseCreated",
    COURSE_UPDATED: "auditActionCourseUpdated",
    COURSE_PUBLISHED: "auditActionCoursePublished",
    COURSE_ARCHIVED: "auditActionCourseArchived",
    COURSE_DELETED: "auditActionCourseDeleted",
    MATERIAL_CREATED: "auditActionMaterialCreated",
    MATERIAL_UPDATED: "auditActionMaterialUpdated",
    MATERIAL_DELETED: "auditActionMaterialDeleted",
    TEST_CREATED: "auditActionTestCreated",
    TEST_SUBMITTED: "auditActionTestSubmitted",
    AI_CHAT: "auditActionAiChat",
    AI_ERROR: "auditActionAiError",
    CATEGORY_CREATED: "auditActionCategoryCreated",
    CATEGORY_UPDATED: "auditActionCategoryUpdated"
  };
  const key = labels[action];
  return key ? i18n.t(key) : action;
}

function CourseWorkspaceNav({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const links = [
    [`/teacher/courses/${courseId}/edit`, t("courseWorkspace")],
    [`/teacher/courses/${courseId}/materials`, t("materials")],
    [`/teacher/courses/${courseId}/tests`, t("tests")],
    [`/teacher/courses/${courseId}/students`, t("students")]
  ];
  return (
    <nav className="workspace-tabs" aria-label={t("courseWorkspace")}>
      {links.map(([href, label]) => (
        <Link key={href} to={href} className={location.pathname === href ? "active" : ""}>{label}</Link>
      ))}
    </nav>
  );
}
