import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./i18n";
import i18n from "./i18n";
import { App } from "./App";

function renderApp(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  void i18n.changeLanguage("ru");
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { items: [], meta: { total: 0 } } }) })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("frontend routes", () => {
  it("Login page renders", () => {
    renderApp("/login");
    expect(screen.getByRole("heading", { name: /вход/i })).toBeInTheDocument();
  });

  it("Register page renders", () => {
    renderApp("/register");
    expect(screen.getByRole("heading", { name: /регистрация/i })).toBeInTheDocument();
  });

  it("Language switch works", async () => {
    renderApp("/login");
    await userEvent.click(screen.getByRole("button", { name: "KZ" }));
    expect(screen.getByRole("heading", { name: /кіру/i })).toBeInTheDocument();
  });

  it("Courses list renders", () => {
    localStorage.setItem("qazaqlearn.token", "token");
    localStorage.setItem("qazaqlearn.role", "STUDENT");
    renderApp("/courses");
    expect(screen.getByRole("heading", { level: 1, name: /курстар|курсы/i })).toBeInTheDocument();
  });

  it("Student cannot see teacher buttons", () => {
    localStorage.setItem("qazaqlearn.token", "token");
    localStorage.setItem("qazaqlearn.role", "STUDENT");
    renderApp("/student");
    expect(screen.queryByText(/создать курс/i)).not.toBeInTheDocument();
  });

  it("Teacher sees create course button", () => {
    localStorage.setItem("qazaqlearn.token", "token");
    localStorage.setItem("qazaqlearn.role", "TEACHER");
    renderApp("/teacher");
    expect(screen.getAllByText(/создать курс|курс құру/i).length).toBeGreaterThan(0);
  });

  it("Admin sees admin menu", () => {
    localStorage.setItem("qazaqlearn.token", "token");
    localStorage.setItem("qazaqlearn.role", "ADMIN");
    renderApp("/admin");
    expect(screen.getAllByText(/пользователи|users/i).length).toBeGreaterThan(0);
  });

  it("AI chat page renders", () => {
    localStorage.setItem("qazaqlearn.token", "token");
    localStorage.setItem("qazaqlearn.role", "STUDENT");
    renderApp("/ai");
    expect(screen.getByRole("heading", { name: /ии|жи/i })).toBeInTheDocument();
  });

  it("Teacher AI test generator page renders", () => {
    localStorage.setItem("qazaqlearn.token", "token");
    localStorage.setItem("qazaqlearn.role", "TEACHER");
    renderApp("/teacher/courses/abc-123/ai-test-gen");
    expect(
      screen.getByRole("heading", { level: 1, name: /генератор|тест/i })
    ).toBeInTheDocument();
  });
});
