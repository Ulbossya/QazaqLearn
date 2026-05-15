import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { AuthGuard } from "./auth/auth.guard";
import { CurrentUser, AuthUser } from "./auth/current-user.decorator";
import { Roles } from "./auth/roles.decorator";
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
  PaginationDto,
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
import { PlatformService } from "./platform.service";

const uploadDir = join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@ApiTags("QazaqLearn")
@Controller()
export class AppController {
  constructor(private readonly platform: PlatformService) {}

  @Get("health")
  @ApiOperation({ summary: "Liveness probe" })
  health() {
    return { status: "ok", service: "qazaqlearn-api" };
  }

  @Post("auth/register")
  @ApiOperation({ summary: "Register student account" })
  register(@Body() dto: RegisterDto) {
    return this.platform.register(dto);
  }

  @Post("auth/login")
  @ApiOperation({ summary: "Login with email and password" })
  login(@Body() dto: LoginDto) {
    return this.platform.login(dto);
  }

  @Get("auth/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user" })
  authMe(@CurrentUser() user: AuthUser) {
    return this.platform.me(user);
  }

  @Post("auth/logout")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout current session" })
  logout() {
    return this.platform.logout();
  }

  @Post("auth/refresh")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Prepared refresh endpoint for Stage 2 token rotation" })
  refresh(@CurrentUser() user: AuthUser) {
    return this.platform.refresh(user);
  }

  @Get("users/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get profile" })
  me(@CurrentUser() user: AuthUser) {
    return this.platform.me(user);
  }

  @Put("users/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update profile" })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.platform.updateMe(user, dto);
  }

  @Put("users/me/language")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update preferred language" })
  updateLanguage(@CurrentUser() user: AuthUser, @Body() dto: UpdateLanguageDto) {
    return this.platform.updateLanguage(user, dto);
  }

  @Get("categories")
  @ApiOperation({ summary: "List course categories" })
  categories() {
    return this.platform.listCategories();
  }

  @Post("admin/categories")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create category" })
  createCategory(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.platform.createCategory(user, dto);
  }

  @Put("admin/categories/:id")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update category" })
  updateCategory(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: CreateCategoryDto) {
    return this.platform.updateCategory(user, id, dto);
  }

  @Get("courses")
  @ApiOperation({ summary: "List course catalog" })
  courses(@Query() query: PaginationDto & { categoryId?: string; status?: string }) {
    return this.platform.listCourses(undefined, query);
  }

  @Get("teacher/courses")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List manageable courses" })
  teacherCourses(@CurrentUser() user: AuthUser, @Query() query: PaginationDto & { status?: string }) {
    return this.platform.listManageableCourses(user, query);
  }

  @Post("courses")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create course" })
  createCourse(@CurrentUser() user: AuthUser, @Body() dto: CreateCourseDto) {
    return this.platform.createCourse(user, dto);
  }

  @Put("courses/:id/publish")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Publish course" })
  publishCourse(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.publishCourse(user, id);
  }

  @Put("courses/:id/archive")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Archive course" })
  archiveCourse(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.archiveCourse(user, id);
  }

  @Put("courses/:id")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update course" })
  updateCourse(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateCourseDto) {
    return this.platform.updateCourse(user, id, dto);
  }

  @Delete("courses/:id")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete course" })
  deleteCourse(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.deleteCourse(user, id);
  }

  @Get("courses/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get course card" })
  getCourse(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.getCourse(user, id);
  }

  @Post("courses/:courseId/materials")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create material" })
  createMaterial(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string, @Body() dto: CreateMaterialDto) {
    return this.platform.createMaterial(user, courseId, dto);
  }

  @Get("courses/:courseId/materials")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List course materials" })
  listMaterials(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string) {
    return this.platform.listMaterials(user, courseId);
  }

  @Get("materials/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get material" })
  getMaterial(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.getMaterial(user, id);
  }

  @Put("materials/:id")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update material" })
  updateMaterial(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateMaterialDto) {
    return this.platform.updateMaterial(user, id, dto);
  }

  @Delete("materials/:id")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete material" })
  deleteMaterial(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.deleteMaterial(user, id);
  }

  @Post("materials/:id/complete")
  @UseGuards(AuthGuard)
  @Roles("STUDENT")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark material completed" })
  completeMaterial(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.completeMaterial(user, id);
  }

  @Post("enrollments")
  @UseGuards(AuthGuard)
  @Roles("STUDENT")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Enroll student to course" })
  enroll(@CurrentUser() user: AuthUser, @Body() dto: EnrollmentDto) {
    return this.platform.enroll(user, dto);
  }

  @Get("enrollments/my")
  @UseGuards(AuthGuard)
  @Roles("STUDENT")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List my courses" })
  myEnrollments(@CurrentUser() user: AuthUser) {
    return this.platform.myEnrollments(user);
  }

  @Get("courses/:courseId/students")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List students enrolled to course" })
  courseStudents(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string, @Query() query: PaginationDto) {
    return this.platform.courseStudents(user, courseId, query);
  }

  @Post("courses/:courseId/tests")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create test" })
  createTest(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string, @Body() dto: CreateTestDto) {
    return this.platform.createTest(user, courseId, dto);
  }

  @Get("courses/:courseId/tests")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List course tests" })
  listTests(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string) {
    return this.platform.listTests(user, courseId);
  }

  @Get("tests/:testId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get test" })
  getTest(@CurrentUser() user: AuthUser, @Param("testId") testId: string) {
    return this.platform.getTest(user, testId);
  }

  @Post("tests/:testId/questions")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create SINGLE question" })
  createQuestion(@CurrentUser() user: AuthUser, @Param("testId") testId: string, @Body() dto: CreateQuestionDto) {
    return this.platform.createQuestion(user, testId, dto);
  }

  @Post("tests/:testId/submit")
  @UseGuards(AuthGuard)
  @Roles("STUDENT")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submit test attempt" })
  submitTest(@CurrentUser() user: AuthUser, @Param("testId") testId: string, @Body() dto: SubmitTestDto) {
    return this.platform.submitTest(user, testId, dto);
  }

  @Get("tests/:testId/attempts/my")
  @UseGuards(AuthGuard)
  @Roles("STUDENT")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List my test attempts" })
  myAttempts(@CurrentUser() user: AuthUser, @Param("testId") testId: string) {
    return this.platform.myAttempts(user, testId);
  }

  @Get("tests/:testId/attempts")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List test attempts for teacher/admin" })
  testAttempts(@CurrentUser() user: AuthUser, @Param("testId") testId: string) {
    return this.platform.testAttempts(user, testId);
  }

  @Get("progress/:courseId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get my course progress" })
  getProgress(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string) {
    return this.platform.getProgress(user, courseId);
  }

  @Get("courses/:courseId/progress")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get course student progress" })
  courseProgress(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string) {
    return this.platform.courseProgress(user, courseId);
  }

  @Post("ai/chat")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ask AI assistant" })
  aiChat(@Headers("authorization") token: string, @Body() dto: AiChatDto) {
    return this.platform.aiChat(token, dto);
  }

  @Get("ai/history")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List AI request history" })
  aiHistory(@Headers("authorization") token: string, @Query() query: PaginationDto) {
    return this.platform.aiHistory(token, query);
  }

  @Post("ai/summarize-material")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "AI material summary" })
  summarize(@Headers("authorization") token: string, @Body() dto: AiChatDto) {
    return this.platform.aiWrapper(token, dto, "summary");
  }

  @Post("ai/generate-questions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "AI question generation" })
  generateQuestions(@Headers("authorization") token: string, @Body() dto: AiChatDto) {
    return this.platform.aiWrapper(token, dto, "questions");
  }

  @Post("ai/translate")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "AI translation" })
  translate(@Headers("authorization") token: string, @Body() dto: AiChatDto) {
    return this.platform.aiWrapper(token, dto, "translate");
  }

  @Post("ai/teacher/generate-test")
  @UseGuards(AuthGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "AI test generator for teachers" })
  generateTeacherTest(@Headers("authorization") token: string, @Body() dto: GenerateTestDto) {
    return this.platform.aiTeacherGenerateTest(token, dto);
  }

  @Post("files/upload")
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, callback) => {
          const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${suffix}${extname(file.originalname).toLowerCase()}`);
        }
      })
    })
  )
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } }
    }
  })
  @ApiOperation({ summary: "Upload PDF or image" })
  uploadFile(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    return this.platform.handleUploadedFile(user, file);
  }

  @Get("files/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get file metadata" })
  getFile(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.getFile(user, id);
  }

  @Get("notifications")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List notifications" })
  notifications(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    return this.platform.notifications(user, query);
  }

  @Put("notifications/read-all")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark all notifications as read" })
  readAllNotifications(@CurrentUser() user: AuthUser) {
    return this.platform.readAllNotifications(user);
  }

  @Put("notifications/:id/read")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark notification as read" })
  readNotification(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.platform.readNotification(user, id);
  }

  @Post("courses/:courseId/reviews")
  @UseGuards(AuthGuard)
  @Roles("STUDENT")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create or update course review" })
  createReview(@CurrentUser() user: AuthUser, @Param("courseId") courseId: string, @Body() dto: ReviewDto) {
    return this.platform.createReview(user, courseId, dto);
  }

  @Get("courses/:courseId/reviews")
  @ApiOperation({ summary: "List course reviews" })
  listReviews(@Param("courseId") courseId: string) {
    return this.platform.listReviews(courseId);
  }

  @Get("admin/users")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list users" })
  adminUsers(@Query() query: PaginationDto) {
    return this.platform.listUsers(query);
  }

  @Put("admin/users/:id/role")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin change user role" })
  adminRole(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return this.platform.updateUserRole(user, id, dto);
  }

  @Put("admin/users/:id/status")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin change user status" })
  adminStatus(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.platform.updateUserStatus(user, id, dto);
  }

  @Get("admin/courses")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list all courses" })
  adminCourses(@Query() query: PaginationDto) {
    return this.platform.adminCourses(query);
  }

  @Get("admin/audit-logs")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list audit logs" })
  auditLogs(@Query() query: PaginationDto) {
    return this.platform.auditLogs(query);
  }

  @Get("admin/ai-history")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list AI history" })
  adminAiHistory(@Headers("authorization") token: string, @Query() query: PaginationDto) {
    return this.platform.aiHistory(token, query);
  }

  @Get("admin/dashboard")
  @UseGuards(AuthGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin dashboard metrics" })
  adminDashboard() {
    return this.platform.adminDashboard();
  }
}
