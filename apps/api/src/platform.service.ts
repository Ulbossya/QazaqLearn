import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Errors, AppError } from "./common/app-error";
import { normalizePagination, paginated, PaginationQuery } from "./common/pagination";
import { PrismaService } from "./prisma.service";
import { AuthUser } from "./auth/current-user.decorator";
import {
  AiChatDto,
  CreateCategoryDto,
  CreateCourseDto,
  CreateMaterialDto,
  CreateQuestionDto,
  CreateTestDto,
  EnrollmentDto,
  GenerateTestDto,
  LoginDto,
  RegisterDto,
  ReviewDto,
  SubmitTestDto,
  UpdateCourseDto,
  UpdateLanguageDto,
  UpdateMaterialDto,
  UpdateProfileDto,
  UpdateRoleDto,
  UpdateStatusDto
} from "./dto";
import { calculateProgress } from "./progress/progress.util";

export function aiServiceBaseUrl(): string {
  return process.env.AI_SERVICE_URL || "http://localhost:8080";
}

export function buildAiUrl(path: string): string {
  const base = aiServiceBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

@Injectable()
export class PlatformService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw Errors.validation();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        preferredLanguage: dto.preferredLanguage,
        role: "STUDENT"
      }
    });
    return this.loginResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw Errors.unauthorized();
    if (user.status === "BLOCKED") throw Errors.userBlocked();
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw Errors.unauthorized();
    return this.loginResponse(user);
  }

  logout() {
    return { loggedOut: true };
  }

  refresh(user: AuthUser) {
    return this.loginResponse(user);
  }

  async me(user: AuthUser) {
    const full = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!full) throw Errors.userNotFound();
    return this.safeUser(full);
  }

  async updateMe(user: AuthUser, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: dto.fullName,
        preferredLanguage: dto.preferredLanguage
      }
    });
    return this.safeUser(updated);
  }

  async updateLanguage(user: AuthUser, dto: UpdateLanguageDto) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { preferredLanguage: dto.preferredLanguage }
    });
    return this.safeUser(updated);
  }

  async listUsers(query: PaginationQuery) {
    const { page, limit, skip, order } = normalizePagination(query);
    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: "insensitive" } },
            { fullName: { contains: query.search, mode: "insensitive" } }
          ]
        }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: order },
        select: {
          id: true,
          email: true,
          fullName: true,
          preferredLanguage: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      this.prisma.user.count({ where })
    ]);
    return paginated(items, total, page, limit);
  }

  async updateUserRole(actor: AuthUser, id: string, dto: UpdateRoleDto) {
    const user = await this.prisma.user.update({ where: { id }, data: { role: dto.role } });
    await this.audit(actor.id, "USER_ROLE_CHANGED", "User", id, { role: dto.role });
    await this.notify(id, "ROLE_CHANGED", "Роль изменена", "Рөл өзгертілді", `Новая роль: ${dto.role}`, `Жаңа рөл: ${dto.role}`);
    return this.safeUser(user);
  }

  async updateUserStatus(actor: AuthUser, id: string, dto: UpdateStatusDto) {
    const user = await this.prisma.user.update({ where: { id }, data: { status: dto.status } });
    await this.audit(actor.id, "USER_STATUS_CHANGED", "User", id, { status: dto.status });
    if (dto.status === "BLOCKED") {
      await this.notify(id, "USER_BLOCKED", "Пользователь заблокирован", "Пайдаланушы бұғатталды", "Доступ к платформе ограничен.", "Платформаға кіру шектелді.");
    }
    return this.safeUser(user);
  }

  async listCategories() {
    return this.prisma.courseCategory.findMany({ orderBy: { nameRu: "asc" } });
  }

  async createCategory(actor: AuthUser, dto: CreateCategoryDto) {
    const category = await this.prisma.courseCategory.create({ data: dto });
    await this.audit(actor.id, "CATEGORY_CREATED", "CourseCategory", category.id, dto);
    return category;
  }

  async updateCategory(actor: AuthUser, id: string, dto: CreateCategoryDto) {
    const category = await this.prisma.courseCategory.update({ where: { id }, data: dto });
    await this.audit(actor.id, "CATEGORY_UPDATED", "CourseCategory", id, dto);
    return category;
  }

  async listCourses(user: AuthUser | undefined, query: PaginationQuery & { categoryId?: string; status?: string }) {
    const { page, limit, skip, order } = normalizePagination(query);
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      status: user?.role === "ADMIN" && query.status ? (query.status as never) : "PUBLISHED"
    };
    if (user?.role === "TEACHER") {
      where.OR = [{ status: "PUBLISHED" }, { teacherId: user.id }];
      delete where.status;
      where.deletedAt = null;
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.AND = [
        {
          OR: [
            { titleRu: { contains: query.search, mode: "insensitive" } },
            { titleKz: { contains: query.search, mode: "insensitive" } },
            { descriptionRu: { contains: query.search, mode: "insensitive" } },
            { descriptionKz: { contains: query.search, mode: "insensitive" } }
          ]
        }
      ];
    }
    const items = await this.prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: order },
      include: { category: true, teacher: { select: { id: true, fullName: true } }, reviews: true }
    });
    const total = await this.prisma.course.count({ where });
    return paginated(
      items.map((course) => ({
        ...course,
        averageRating: course.reviews.length ? course.reviews.reduce((sum: number, r) => sum + r.rating, 0) / course.reviews.length : null
      })),
      total,
      page,
      limit
    );
  }

  async listManageableCourses(user: AuthUser, query: PaginationQuery & { status?: string }) {
    const { page, limit, skip, order } = normalizePagination(query);
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      ...(user.role === "TEACHER" ? { teacherId: user.id } : {}),
      ...(query.status ? { status: query.status as never } : {})
    };
    if (query.search) {
      where.OR = [
        { titleRu: { contains: query.search, mode: "insensitive" } },
        { titleKz: { contains: query.search, mode: "insensitive" } },
        { descriptionRu: { contains: query.search, mode: "insensitive" } },
        { descriptionKz: { contains: query.search, mode: "insensitive" } }
      ];
    }
    const items = await this.prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: order },
      include: {
        category: true,
        teacher: { select: { id: true, fullName: true } },
        materials: { where: { isDeleted: false }, select: { id: true } },
        tests: { select: { id: true } },
        enrollments: { select: { id: true } },
        reviews: true
      }
    });
    const total = await this.prisma.course.count({ where });
    return paginated(
      items.map(({ materials, tests, enrollments, reviews, ...course }) => ({
        ...course,
        averageRating: reviews.length ? reviews.reduce((sum: number, review) => sum + review.rating, 0) / reviews.length : null,
        contentSummary: {
          materialCount: materials.length,
          testCount: tests.length,
          enrollmentCount: enrollments.length
        }
      })),
      total,
      page,
      limit
    );
  }

  async getCourse(user: AuthUser, id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        teacher: { select: { id: true, fullName: true } },
        materials: { where: { isDeleted: false }, orderBy: { orderIndex: "asc" } },
        tests: { include: { questions: true } },
        reviews: true
      }
    });
    if (!course || course.deletedAt) throw Errors.courseNotFound();
    await this.assertCourseReadable(user, course);
    const contentSummary = {
      materialCount: course.materials.length,
      testCount: course.tests.length,
      questionCount: course.tests.reduce((sum, test) => sum + test.questions.length, 0)
    };
    if (user.role === "STUDENT") {
      const [studentProgress, scoreSummary, studentEnrollment] = await Promise.all([
        this.prisma.progress.findUnique({ where: { courseId_studentId: { courseId: id, studentId: user.id } } }),
        this.getCourseScoreSummary(user.id, id),
        this.prisma.enrollment.findUnique({ where: { courseId_studentId: { courseId: id, studentId: user.id } } })
      ]);
      return { ...course, contentSummary, studentProgress, scoreSummary, studentEnrollment };
    }
    const [enrollmentCount, completedStudents, progressAggregate] = await Promise.all([
      this.prisma.enrollment.count({ where: { courseId: id, status: { not: "CANCELLED" } } }),
      this.prisma.enrollment.count({ where: { courseId: id, status: "COMPLETED" } }),
      this.prisma.progress.aggregate({ where: { courseId: id }, _avg: { percent: true } })
    ]);
    return {
      ...course,
      contentSummary,
      managementSummary: {
        enrollmentCount,
        completedStudents,
        averageProgress: progressAggregate._avg.percent ?? 0
      }
    };
  }

  async createCourse(user: AuthUser, dto: CreateCourseDto) {
    this.assertCourseText(dto);
    const course = await this.prisma.course.create({
      data: {
        ...dto,
        teacherId: user.id,
        status: "DRAFT",
        createdBy: user.id,
        updatedBy: user.id
      }
    });
    await this.audit(user.id, "COURSE_CREATED", "Course", course.id, dto);
    return course;
  }

  async updateCourse(user: AuthUser, id: string, dto: UpdateCourseDto) {
    this.assertCourseText(dto);
    const course = await this.getCourseForManage(user, id);
    const updated = await this.prisma.course.update({
      where: { id: course.id },
      data: { ...dto, updatedBy: user.id }
    });
    await this.audit(user.id, "COURSE_UPDATED", "Course", id, dto);
    return updated;
  }

  async publishCourse(user: AuthUser, id: string) {
    const course = await this.getCourseForManage(user, id);
    const materialCount = await this.prisma.courseMaterial.count({ where: { courseId: id, isDeleted: false } });
    if (!(course.titleRu || course.titleKz) || !(course.descriptionRu || course.descriptionKz) || !course.categoryId || materialCount < 1) {
      throw Errors.validation();
    }
    const updated = await this.prisma.course.update({ where: { id }, data: { status: "PUBLISHED", updatedBy: user.id } });
    await this.audit(user.id, "COURSE_PUBLISHED", "Course", id, {});
    await this.notify(user.id, "COURSE_PUBLISHED", "Курс опубликован", "Курс жарияланды", "Курс доступен студентам.", "Курс студенттерге қолжетімді.");
    return updated;
  }

  async archiveCourse(user: AuthUser, id: string) {
    await this.getCourseForManage(user, id);
    const updated = await this.prisma.course.update({ where: { id }, data: { status: "ARCHIVED", updatedBy: user.id } });
    await this.audit(user.id, "COURSE_ARCHIVED", "Course", id, {});
    return updated;
  }

  async deleteCourse(user: AuthUser, id: string) {
    await this.getCourseForManage(user, id);
    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: "DELETED", deletedAt: new Date(), updatedBy: user.id }
    });
    await this.audit(user.id, "COURSE_DELETED", "Course", id, {});
    return updated;
  }

  async createMaterial(user: AuthUser, courseId: string, dto: CreateMaterialDto) {
    await this.getCourseForManage(user, courseId);
    const material = await this.prisma.courseMaterial.create({
      data: { ...dto, courseId, createdBy: user.id, updatedBy: user.id }
    });
    await this.audit(user.id, "MATERIAL_CREATED", "CourseMaterial", material.id, { courseId });
    return material;
  }

  async listMaterials(user: AuthUser, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Errors.courseNotFound();
    await this.assertCourseReadable(user, course);
    return this.prisma.courseMaterial.findMany({ where: { courseId, isDeleted: false }, orderBy: { orderIndex: "asc" } });
  }

  async getMaterial(user: AuthUser, id: string) {
    const material = await this.prisma.courseMaterial.findUnique({ where: { id }, include: { course: true } });
    if (!material || material.isDeleted) throw Errors.materialNotFound();
    await this.assertCourseReadable(user, material.course);
    return material;
  }

  async updateMaterial(user: AuthUser, id: string, dto: UpdateMaterialDto) {
    const material = await this.prisma.courseMaterial.findUnique({ where: { id }, include: { course: true } });
    if (!material || material.isDeleted) throw Errors.materialNotFound();
    await this.assertCourseOwner(user, material.course);
    const updated = await this.prisma.courseMaterial.update({
      where: { id },
      data: { ...dto, updatedBy: user.id }
    });
    await this.audit(user.id, "MATERIAL_UPDATED", "CourseMaterial", id, {});
    return updated;
  }

  async deleteMaterial(user: AuthUser, id: string) {
    const material = await this.prisma.courseMaterial.findUnique({ where: { id }, include: { course: true } });
    if (!material || material.isDeleted) throw Errors.materialNotFound();
    await this.assertCourseOwner(user, material.course);
    const updated = await this.prisma.courseMaterial.update({ where: { id }, data: { isDeleted: true, updatedBy: user.id } });
    await this.audit(user.id, "MATERIAL_DELETED", "CourseMaterial", id, {});
    return updated;
  }

  async completeMaterial(user: AuthUser, id: string) {
    if (user.role !== "STUDENT") throw Errors.forbidden();
    const material = await this.getMaterial(user, id);
    await this.assertEnrolled(user.id, material.courseId);
    const progress = await this.prisma.materialProgress.upsert({
      where: { materialId_studentId: { materialId: id, studentId: user.id } },
      update: {},
      create: { materialId: id, studentId: user.id }
    });
    await this.recalculateProgress(user.id, material.courseId);
    return progress;
  }

  async enroll(user: AuthUser, dto: EnrollmentDto) {
    if (user.role !== "STUDENT") throw Errors.forbidden();
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course || course.deletedAt) throw Errors.courseNotFound();
    if (course.status !== "PUBLISHED") throw Errors.courseNotPublished();
    const existing = await this.prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId: dto.courseId, studentId: user.id } }
    });
    if (existing) throw Errors.alreadyEnrolled();
    const enrollment = await this.prisma.enrollment.create({
      data: { courseId: dto.courseId, studentId: user.id, status: "ACTIVE" }
    });
    await this.notify(course.teacherId, "ENROLLMENT_CREATED", "Новый студент", "Жаңа студент", "Студент записался на курс.", "Студент курсқа жазылды.");
    await this.recalculateProgress(user.id, dto.courseId);
    return enrollment;
  }

  async myEnrollments(user: AuthUser) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: user.id },
      include: { course: { include: { category: true } } },
      orderBy: { createdAt: "desc" }
    });
    return Promise.all(
      enrollments.map(async (enrollment) => ({
        ...enrollment,
        progress: await this.prisma.progress.findUnique({
          where: { courseId_studentId: { courseId: enrollment.courseId, studentId: user.id } }
        }),
        scoreSummary: await this.getCourseScoreSummary(user.id, enrollment.courseId)
      }))
    );
  }

  async courseStudents(user: AuthUser, courseId: string, query: PaginationQuery) {
    await this.getCourseForManage(user, courseId);
    const { page, limit, skip, order } = normalizePagination(query);
    const where: Prisma.EnrollmentWhereInput = {
      courseId,
      student: query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : undefined
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: order },
        include: { student: { select: { id: true, fullName: true, email: true } } }
      }),
      this.prisma.enrollment.count({ where })
    ]);
    const enrichedItems = await Promise.all(
      items.map(async (item) => ({
        ...item,
        progress: await this.prisma.progress.findUnique({
          where: { courseId_studentId: { courseId, studentId: item.studentId } }
        }),
        scoreSummary: await this.getCourseScoreSummary(item.studentId, courseId)
      }))
    );
    return paginated(enrichedItems, total, page, limit);
  }

  async createTest(user: AuthUser, courseId: string, dto: CreateTestDto) {
    await this.getCourseForManage(user, courseId);
    const test = await this.prisma.courseTest.create({
      data: { ...dto, courseId, createdBy: user.id, updatedBy: user.id }
    });
    await this.audit(user.id, "TEST_CREATED", "CourseTest", test.id, { courseId });
    return test;
  }

  async listTests(user: AuthUser, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw Errors.courseNotFound();
    await this.assertCourseReadable(user, course);
    return this.prisma.courseTest.findMany({ where: { courseId }, include: { questions: true }, orderBy: { createdAt: "desc" } });
  }

  async getTest(user: AuthUser, testId: string) {
    const test = await this.prisma.courseTest.findUnique({ where: { id: testId }, include: { questions: true, course: true } });
    if (!test) throw Errors.testNotFound();
    await this.assertCourseReadable(user, test.course);
    return test;
  }

  async createQuestion(user: AuthUser, testId: string, dto: CreateQuestionDto) {
    const test = await this.prisma.courseTest.findUnique({ where: { id: testId }, include: { course: true } });
    if (!test) throw Errors.testNotFound();
    await this.assertCourseOwner(user, test.course);
    if (dto.type === "TEXT") {
      const question = await this.prisma.testQuestion.create({
        data: {
          questionTextRu: dto.questionTextRu,
          questionTextKz: dto.questionTextKz,
          type: "TEXT",
          options: [],
          correctAnswer: dto.correctAnswer.trim(),
          points: dto.points,
          testId,
          createdBy: user.id,
          updatedBy: user.id
        }
      });
      return question;
    }
    if (dto.type !== "SINGLE" && dto.type !== "MULTIPLE") throw Errors.validation();
    if (!dto.options || dto.options.length < 2) throw Errors.validation();
    const correctAnswer =
      dto.type === "MULTIPLE"
        ? dto.correctAnswer
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .sort()
            .join(",")
        : dto.correctAnswer;
    const question = await this.prisma.testQuestion.create({
      data: {
        ...dto,
        correctAnswer,
        options: dto.options as unknown as Prisma.InputJsonValue,
        testId,
        createdBy: user.id,
        updatedBy: user.id
      }
    });
    return question;
  }

  async submitTest(user: AuthUser, testId: string, dto: SubmitTestDto) {
    if (user.role !== "STUDENT") throw Errors.forbidden();
    const test = await this.prisma.courseTest.findUnique({ where: { id: testId }, include: { questions: true, course: true } });
    if (!test) throw Errors.testNotFound();
    await this.assertCourseReadable(user, test.course);
    await this.assertEnrolled(user.id, test.courseId);

    const answers = new Map(dto.answers.map((answer) => [answer.questionId, answer.answer]));
    const total = test.questions.reduce((sum, question) => sum + question.points, 0);
    const earned = test.questions.reduce((sum, question) => {
      const submitted = answers.get(question.id);
      if (submitted === undefined) return sum;
      if (question.type === "MULTIPLE") {
        const normalize = (value: string) =>
          value
            .split(",")
            .map((part) => part.trim().toLowerCase())
            .filter(Boolean)
            .sort()
            .join(",");
        return sum + (normalize(submitted) === normalize(question.correctAnswer) ? question.points : 0);
      }
      if (question.type === "TEXT") {
        const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
        return sum + (normalizeText(submitted) === normalizeText(question.correctAnswer) ? question.points : 0);
      }
      return sum + (submitted === question.correctAnswer ? question.points : 0);
    }, 0);
    const score = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed = score >= test.passScore;
    const attempt = await this.prisma.testAttempt.create({
      data: {
        testId,
        studentId: user.id,
        answers: dto.answers as unknown as Prisma.InputJsonValue,
        score,
        passed
      }
    });
    await this.audit(user.id, "TEST_SUBMITTED", "CourseTest", testId, { score, passed });
    await this.notify(user.id, "TEST_COMPLETED", "Тест завершен", "Тест аяқталды", `Результат: ${score}%`, `Нәтиже: ${score}%`);
    await this.recalculateProgress(user.id, test.courseId);
    return attempt;
  }

  async myAttempts(user: AuthUser, testId: string) {
    return this.prisma.testAttempt.findMany({ where: { testId, studentId: user.id }, orderBy: { createdAt: "desc" } });
  }

  async testAttempts(user: AuthUser, testId: string) {
    const test = await this.prisma.courseTest.findUnique({ where: { id: testId }, include: { course: true } });
    if (!test) throw Errors.testNotFound();
    await this.assertCourseOwner(user, test.course);
    return this.prisma.testAttempt.findMany({
      where: { testId },
      include: { student: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async getProgress(user: AuthUser, courseId: string) {
    if (user.role === "STUDENT") await this.assertEnrolled(user.id, courseId);
    const [progress, scoreSummary] = await Promise.all([
      this.recalculateProgress(user.id, courseId),
      this.getCourseScoreSummary(user.id, courseId)
    ]);
    return { ...progress, scoreSummary };
  }

  async courseProgress(user: AuthUser, courseId: string) {
    await this.getCourseForManage(user, courseId);
    const progress = await this.prisma.progress.findMany({
      where: { courseId },
      include: { student: { select: { id: true, fullName: true, email: true } } },
      orderBy: { percent: "desc" }
    });
    return Promise.all(
      progress.map(async (item) => ({
        ...item,
        scoreSummary: await this.getCourseScoreSummary(item.studentId, courseId)
      }))
    );
  }

  async aiChat(token: string, dto: AiChatDto) {
    return this.forwardAi("/ai/chat", token, dto);
  }

  async aiWrapper(token: string, dto: AiChatDto, mode: "summary" | "questions" | "translate") {
    const path = mode === "summary"
      ? "/ai/summarize-material"
      : mode === "questions"
        ? "/ai/generate-questions"
        : "/ai/translate";
    return this.forwardAi(path, token, dto);
  }

  async aiHistory(token: string, query: PaginationQuery) {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    const suffix = params.toString();
    return this.forwardAi(`/ai/history${suffix ? `?${suffix}` : ""}`, token, undefined, "GET");
  }

  async aiTeacherGenerateTest(token: string, dto: GenerateTestDto) {
    return this.forwardAi("/ai/teacher/generate-test", token, dto);
  }

  private async forwardAi<T = unknown>(path: string, token: string | undefined, body?: unknown, method: "GET" | "POST" = "POST"): Promise<T> {
    if (!token) throw Errors.unauthorized();
    const init: RequestInit = {
      method,
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    };
    if (body !== undefined && method !== "GET") {
      init.body = JSON.stringify(body);
    }
    const url = buildAiUrl(path);
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      throw Errors.aiUnavailable();
    }
    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (!response.ok || payload?.success === false) {
      const err = payload?.error || {};
      
      if (response.status === 404 && (err.messageRu?.includes("Cannot POST") || err.message?.includes("Not Found"))) {
        throw new AppError(
          "AI_MICROSERVICE_NOT_FOUND",
          "Не удалось подключиться к Java микросервису AI. Убедитесь, что ai-java запущен и AI_SERVICE_URL настроен правильно.",
          "Java AI микросервисіне қосылу мүмкін болмады. AI_SERVICE_URL дұрыс екеніне көз жеткізіңіз.",
          503
        );
      }

      const hasDownstreamError = typeof err.code === "string";
      throw new AppError(
        err.code || "AI_PROVIDER_UNAVAILABLE",
        err.messageRu || err.message || "AI-сервис временно недоступен",
        err.messageKz || "AI қызметі уақытша қолжетімсіз",
        hasDownstreamError ? response.status : 503
      );
    }
    return payload as T;
  }

  async handleUploadedFile(user: AuthUser, file?: Express.Multer.File) {
    if (!file) throw Errors.validation();
    const isPdf = file.mimetype === "application/pdf";
    const isImage = ["image/png", "image/jpeg"].includes(file.mimetype);
    if (!isPdf && !isImage) throw Errors.unsupportedFileType();
    const maxPdf = Number(process.env.MAX_PDF_SIZE_MB || 20) * 1024 * 1024;
    const maxImage = Number(process.env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024;
    if ((isPdf && file.size > maxPdf) || (isImage && file.size > maxImage)) throw Errors.fileTooLarge();
    const saved = await this.prisma.fileUpload.create({
      data: {
        uploadedBy: user.id,
        originalName: file.originalname,
        storedName: file.filename,
        fileUrl: `/uploads/${file.filename}`,
        contentType: file.mimetype,
        sizeBytes: BigInt(file.size)
      }
    });
    return {
      id: saved.id,
      fileUrl: saved.fileUrl,
      fileName: saved.originalName,
      contentType: saved.contentType,
      size: Number(saved.sizeBytes)
    };
  }

  async getFile(user: AuthUser, id: string) {
    const file = await this.prisma.fileUpload.findUnique({ where: { id } });
    if (!file) throw Errors.materialNotFound();
    if (user.role !== "ADMIN" && file.uploadedBy !== user.id) throw Errors.forbidden();
    return { ...file, sizeBytes: Number(file.sizeBytes) };
  }

  async notifications(user: AuthUser, query: PaginationQuery) {
    const { page, limit, skip, order } = normalizePagination(query);
    const where = { userId: user.id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: order } }),
      this.prisma.notification.count({ where })
    ]);
    return paginated(items, total, page, limit);
  }

  async readNotification(user: AuthUser, id: string) {
    const result = await this.prisma.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
    return { updated: result.count };
  }

  async readAllNotifications(user: AuthUser) {
    const result = await this.prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
    return { updated: result.count };
  }

  async createReview(user: AuthUser, courseId: string, dto: ReviewDto) {
    if (user.role !== "STUDENT") throw Errors.forbidden();
    await this.assertEnrolled(user.id, courseId);
    return this.prisma.courseReview.upsert({
      where: { courseId_studentId: { courseId, studentId: user.id } },
      update: dto,
      create: { courseId, studentId: user.id, ...dto }
    });
  }

  async listReviews(courseId: string) {
    return this.prisma.courseReview.findMany({
      where: { courseId },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async adminCourses(query: PaginationQuery) {
    const { page, limit, skip, order } = normalizePagination(query);
    const where: Prisma.CourseWhereInput = query.search
      ? {
          OR: [
            { titleRu: { contains: query.search, mode: "insensitive" } },
            { titleKz: { contains: query.search, mode: "insensitive" } }
          ]
        }
      : {};
    const items = await this.prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: order },
      include: {
        teacher: true,
        category: true,
        materials: { where: { isDeleted: false }, select: { id: true } },
        tests: { select: { id: true } },
        enrollments: { select: { id: true } }
      }
    });
    const total = await this.prisma.course.count({ where });
    return paginated(
      items.map(({ materials, tests, enrollments, ...item }) => ({
        ...item,
        teacher: this.safeUser(item.teacher),
        contentSummary: {
          materialCount: materials.length,
          testCount: tests.length,
          enrollmentCount: enrollments.length
        }
      })),
      total,
      page,
      limit
    );
  }

  async auditLogs(query: PaginationQuery) {
    const { page, limit, skip, order } = normalizePagination(query);
    const where: Prisma.AuditLogWhereInput = query.search
      ? { entityType: { contains: query.search, mode: "insensitive" } }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: order },
        include: { actor: { select: { id: true, fullName: true, email: true, role: true } } }
      }),
      this.prisma.auditLog.count({ where })
    ]);
    return paginated(items, total, page, limit);
  }

  async adminDashboard() {
    const [users, courses, aiRequests, auditLogs, blockedUsers, todayActivity] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.course.count({ where: { deletedAt: null } }),
      this.prisma.aiRequestHistory.count(),
      this.prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" } }),
      this.prisma.user.count({ where: { status: "BLOCKED" } }),
      this.prisma.auditLog.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } })
    ]);
    return { users, courses, aiRequests, auditLogs, blockedUsers, todayActivity };
  }

  private loginResponse(user: { id: string; email: string; role: Role; preferredLanguage: string }) {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      accessToken,
      tokenType: "Bearer",
      userId: user.id,
      role: user.role,
      preferredLanguage: user.preferredLanguage
    };
  }

  private safeUser<T extends { passwordHash?: string }>(user: T) {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }

  private assertCourseText(dto: Partial<CreateCourseDto>) {
    if (!(dto.titleRu || dto.titleKz) || !(dto.descriptionRu || dto.descriptionKz)) throw Errors.validation();
  }

  private async getCourseForManage(user: AuthUser, id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course || course.deletedAt) throw Errors.courseNotFound();
    await this.assertCourseOwner(user, course);
    return course;
  }

  private async assertCourseOwner(user: AuthUser, course: { teacherId: string }) {
    if (user.role === "ADMIN") return;
    if (user.role === "TEACHER" && course.teacherId === user.id) return;
    throw Errors.forbidden();
  }

  private async assertCourseReadable(user: AuthUser, course: { id: string; teacherId: string; status: string }) {
    if (user.role === "ADMIN") return;
    if (user.role === "TEACHER" && course.teacherId === user.id) return;
    if (course.status !== "PUBLISHED") throw Errors.courseNotPublished();
    if (user.role === "STUDENT") return;
    throw Errors.forbidden();
  }

  private async assertEnrolled(studentId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({ where: { courseId_studentId: { courseId, studentId } } });
    if (!enrollment || enrollment.status === "CANCELLED") throw Errors.notEnrolled();
    return enrollment;
  }

  private async recalculateProgress(studentId: string, courseId: string) {
    const [totalMaterials, completedMaterials, totalTests, passedAttempts] = await Promise.all([
      this.prisma.courseMaterial.count({ where: { courseId, isDeleted: false } }),
      this.prisma.materialProgress.count({ where: { studentId, material: { courseId, isDeleted: false } } }),
      this.prisma.courseTest.count({ where: { courseId } }),
      this.prisma.testAttempt.findMany({ where: { studentId, passed: true, test: { courseId } }, distinct: ["testId"] })
    ]);
    const passedTests = passedAttempts.length;
    const percent = calculateProgress({ completedMaterials, totalMaterials, passedTests, totalTests });
    const progress = await this.prisma.progress.upsert({
      where: { courseId_studentId: { courseId, studentId } },
      update: { completedMaterials, totalMaterials, passedTests, totalTests, percent },
      create: { courseId, studentId, completedMaterials, totalMaterials, passedTests, totalTests, percent }
    });
    if (percent >= 100) {
      await this.prisma.enrollment.updateMany({
        where: { courseId, studentId, status: "ACTIVE" },
        data: { status: "COMPLETED", completedAt: new Date() }
      });
    }
    return progress;
  }

  private async getCourseScoreSummary(studentId: string, courseId: string) {
    const attempts = await this.prisma.testAttempt.findMany({
      where: { studentId, test: { courseId } },
      select: { testId: true, score: true, passed: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    const latestByTest = new Map<string, { score: number; passed: boolean }>();
    for (const attempt of attempts) {
      if (!latestByTest.has(attempt.testId)) {
        latestByTest.set(attempt.testId, { score: attempt.score, passed: attempt.passed });
      }
    }
    const latestAttempts = [...latestByTest.values()];
    return {
      attemptedTests: latestAttempts.length,
      passedLatestTests: latestAttempts.filter((attempt) => attempt.passed).length,
      latestAverageScore: latestAttempts.length
        ? Math.round(latestAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / latestAttempts.length)
        : null,
      bestScore: attempts.length ? Math.max(...attempts.map((attempt) => attempt.score)) : null
    };
  }

  private audit(actorId: string | null, action: Prisma.AuditLogCreateInput["action"], entityType: string, entityId: string | null, metadata: unknown) {
    return this.prisma.auditLog.create({
      data: { actorId, action, entityType, entityId, metadata: metadata as Prisma.InputJsonValue }
    });
  }

  private notify(userId: string, type: Prisma.NotificationCreateInput["type"], titleRu: string, titleKz: string, messageRu: string, messageKz: string) {
    return this.prisma.notification.create({
      data: { userId, type, titleRu, titleKz, messageRu, messageKz }
    });
  }
}
