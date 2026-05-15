describe("API contract examples", () => {
  it("matches success response envelope", () => {
    expect({ success: true, data: {}, message: null }).toEqual({
      success: true,
      data: {},
      message: null
    });
  });

  it("matches error response envelope", () => {
    expect({
      success: false,
      error: {
        code: "COURSE_NOT_FOUND",
        messageRu: "Курс не найден",
        messageKz: "Курс табылмады"
      }
    }).toMatchObject({ success: false, error: { code: "COURSE_NOT_FOUND" } });
  });

  it("documents RegisterRequest", () => {
    expect({
      email: "student@example.com",
      password: "Student123!",
      fullName: "Student Demo",
      preferredLanguage: "ru"
    }).toHaveProperty("preferredLanguage", "ru");
  });

  it("documents AiChatRequest with optional materialId", () => {
    expect({
      courseId: "00000000-0000-0000-0000-000000000000",
      materialId: undefined,
      message: "Объясни материал простыми словами",
      language: "ru"
    }).toHaveProperty("language", "ru");
  });
});
