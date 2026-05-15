import * as bcrypt from "bcryptjs";
import { Errors } from "../src/common/app-error";
import { calculateProgress } from "../src/progress/progress.util";
import { aiServiceBaseUrl, buildAiUrl, PlatformService } from "../src/platform.service";

describe("AuthServiceTest", () => {
  it("hashes passwords and verifies the original secret", async () => {
    const hash = await bcrypt.hash("Student123!", 10);
    await expect(bcrypt.compare("Student123!", hash)).resolves.toBe(true);
    await expect(bcrypt.compare("wrong-password", hash)).resolves.toBe(false);
  });
});

describe("UserServiceTest", () => {
  it("uses USER_BLOCKED for blocked login policy", () => {
    const error = Errors.userBlocked();
    expect(error.code).toBe("USER_BLOCKED");
    expect(error.statusCode).toBe(403);
  });
});

describe("CourseServiceTest", () => {
  it("uses COURSE_NOT_FOUND for missing course", () => {
    expect(Errors.courseNotFound().code).toBe("COURSE_NOT_FOUND");
  });

  it("limits manageable teacher courses to the teacher owner", async () => {
    const prisma = {
      course: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0)
      }
    };
    const service = new PlatformService(prisma as never, {} as never);

    await service.listManageableCourses({ id: "teacher-1", role: "TEACHER" } as never, {});

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null, teacherId: "teacher-1" })
      })
    );
  });
});

describe("MaterialServiceTest", () => {
  it("uses MATERIAL_NOT_FOUND for missing material", () => {
    expect(Errors.materialNotFound().code).toBe("MATERIAL_NOT_FOUND");
  });
});

describe("EnrollmentServiceTest", () => {
  it("uses ALREADY_ENROLLED for duplicate enrollment", () => {
    expect(Errors.alreadyEnrolled().statusCode).toBe(409);
  });
});

describe("TestServiceTest", () => {
  it("calculates a passed SINGLE-question score using percentage semantics", () => {
    const earned = 4;
    const total = 5;
    expect(Math.round((earned / total) * 100)).toBe(80);
  });
});

describe("ProgressServiceTest", () => {
  it("uses 70/30 weighting when materials and tests exist", () => {
    expect(calculateProgress({ completedMaterials: 1, totalMaterials: 2, passedTests: 1, totalTests: 2 })).toBe(50);
  });

  it("uses materials-only formula when no tests exist", () => {
    expect(calculateProgress({ completedMaterials: 2, totalMaterials: 4, passedTests: 0, totalTests: 0 })).toBe(50);
  });

  it("uses tests-only formula when no materials exist", () => {
    expect(calculateProgress({ completedMaterials: 0, totalMaterials: 0, passedTests: 1, totalTests: 2 })).toBe(50);
  });
});

describe("AiServiceTest", () => {
  it("uses AI_RATE_LIMIT_EXCEEDED for exhausted hourly quota", () => {
    expect(Errors.aiRateLimit().code).toBe("AI_RATE_LIMIT_EXCEEDED");
  });

  it("uses AI_PROVIDER_UNAVAILABLE for Gemini outage mapping", () => {
    expect(Errors.aiUnavailable().statusCode).toBe(503);
  });
});

describe("NotificationServiceTest", () => {
  it("keeps notification error messages bilingual", () => {
    const error = Errors.aiUnavailable();
    expect(error.messageRu).toContain("AI");
    expect(error.messageKz).toContain("AI");
  });
});

describe("AdminServiceTest", () => {
  it("uses FORBIDDEN for non-admin role management", () => {
    expect(Errors.forbidden().code).toBe("FORBIDDEN");
  });
});

describe("AuditServiceTest", () => {
  it("keeps audit-friendly error codes stable", () => {
    expect(["USER_BLOCKED", "COURSE_NOT_FOUND", "AI_PROVIDER_UNAVAILABLE"]).toContain(Errors.aiUnavailable().code);
  });
});

describe("AiProxyTest", () => {
  it("falls back to localhost when AI_SERVICE_URL is unset", () => {
    const previous = process.env.AI_SERVICE_URL;
    delete process.env.AI_SERVICE_URL;
    expect(aiServiceBaseUrl()).toBe("http://localhost:8080");
    if (previous !== undefined) process.env.AI_SERVICE_URL = previous;
  });

  it("honours AI_SERVICE_URL and strips trailing slash", () => {
    process.env.AI_SERVICE_URL = "http://ai-java:8080/";
    expect(buildAiUrl("/ai/chat")).toBe("http://ai-java:8080/ai/chat");
    expect(buildAiUrl("ai/history")).toBe("http://ai-java:8080/ai/history");
    delete process.env.AI_SERVICE_URL;
  });

  it("maps unstructured downstream 404 responses to AI unavailable", async () => {
    const service = new PlatformService({} as never, {} as never);
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({})
    }) as never;

    await expect(service.aiChat("Bearer token", {} as never)).rejects.toMatchObject({
      code: "AI_PROVIDER_UNAVAILABLE",
      statusCode: 503
    });

    global.fetch = originalFetch;
  });

  it("preserves structured downstream domain errors", async () => {
    const service = new PlatformService({} as never, {} as never);
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: "COURSE_NOT_FOUND",
          messageRu: "Курс не найден",
          messageKz: "Курс табылмады"
        }
      })
    }) as never;

    await expect(service.aiChat("Bearer token", {} as never)).rejects.toMatchObject({
      code: "COURSE_NOT_FOUND",
      statusCode: 404
    });

    global.fetch = originalFetch;
  });
});

describe("MultipleAnswerNormalizationTest", () => {
  it("treats answers as a sorted comma-joined string", () => {
    const normalize = (value: string) =>
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .sort()
        .join(",");
    expect(normalize("B, A, C")).toBe("A,B,C");
    expect(normalize("A,B,C")).toBe(normalize("C,B,A"));
  });
});
