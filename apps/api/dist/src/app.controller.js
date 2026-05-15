"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const auth_guard_1 = require("./auth/auth.guard");
const current_user_decorator_1 = require("./auth/current-user.decorator");
const roles_decorator_1 = require("./auth/roles.decorator");
const dto_1 = require("./dto");
const platform_service_1 = require("./platform.service");
const uploadDir = (0, node_path_1.join)(process.cwd(), process.env.UPLOAD_DIR || "uploads");
if (!(0, node_fs_1.existsSync)(uploadDir))
    (0, node_fs_1.mkdirSync)(uploadDir, { recursive: true });
let AppController = class AppController {
    platform;
    constructor(platform) {
        this.platform = platform;
    }
    health() {
        return { status: "ok", service: "qazaqlearn-api" };
    }
    register(dto) {
        return this.platform.register(dto);
    }
    login(dto) {
        return this.platform.login(dto);
    }
    authMe(user) {
        return this.platform.me(user);
    }
    logout() {
        return this.platform.logout();
    }
    refresh(user) {
        return this.platform.refresh(user);
    }
    me(user) {
        return this.platform.me(user);
    }
    updateMe(user, dto) {
        return this.platform.updateMe(user, dto);
    }
    updateLanguage(user, dto) {
        return this.platform.updateLanguage(user, dto);
    }
    categories() {
        return this.platform.listCategories();
    }
    createCategory(user, dto) {
        return this.platform.createCategory(user, dto);
    }
    updateCategory(user, id, dto) {
        return this.platform.updateCategory(user, id, dto);
    }
    courses(query) {
        return this.platform.listCourses(undefined, query);
    }
    teacherCourses(user, query) {
        return this.platform.listManageableCourses(user, query);
    }
    createCourse(user, dto) {
        return this.platform.createCourse(user, dto);
    }
    publishCourse(user, id) {
        return this.platform.publishCourse(user, id);
    }
    archiveCourse(user, id) {
        return this.platform.archiveCourse(user, id);
    }
    updateCourse(user, id, dto) {
        return this.platform.updateCourse(user, id, dto);
    }
    deleteCourse(user, id) {
        return this.platform.deleteCourse(user, id);
    }
    getCourse(user, id) {
        return this.platform.getCourse(user, id);
    }
    createMaterial(user, courseId, dto) {
        return this.platform.createMaterial(user, courseId, dto);
    }
    listMaterials(user, courseId) {
        return this.platform.listMaterials(user, courseId);
    }
    getMaterial(user, id) {
        return this.platform.getMaterial(user, id);
    }
    updateMaterial(user, id, dto) {
        return this.platform.updateMaterial(user, id, dto);
    }
    deleteMaterial(user, id) {
        return this.platform.deleteMaterial(user, id);
    }
    completeMaterial(user, id) {
        return this.platform.completeMaterial(user, id);
    }
    enroll(user, dto) {
        return this.platform.enroll(user, dto);
    }
    myEnrollments(user) {
        return this.platform.myEnrollments(user);
    }
    courseStudents(user, courseId, query) {
        return this.platform.courseStudents(user, courseId, query);
    }
    createTest(user, courseId, dto) {
        return this.platform.createTest(user, courseId, dto);
    }
    listTests(user, courseId) {
        return this.platform.listTests(user, courseId);
    }
    getTest(user, testId) {
        return this.platform.getTest(user, testId);
    }
    createQuestion(user, testId, dto) {
        return this.platform.createQuestion(user, testId, dto);
    }
    submitTest(user, testId, dto) {
        return this.platform.submitTest(user, testId, dto);
    }
    myAttempts(user, testId) {
        return this.platform.myAttempts(user, testId);
    }
    testAttempts(user, testId) {
        return this.platform.testAttempts(user, testId);
    }
    getProgress(user, courseId) {
        return this.platform.getProgress(user, courseId);
    }
    courseProgress(user, courseId) {
        return this.platform.courseProgress(user, courseId);
    }
    aiChat(token, dto) {
        return this.platform.aiChat(token, dto);
    }
    aiHistory(token, query) {
        return this.platform.aiHistory(token, query);
    }
    summarize(token, dto) {
        return this.platform.aiWrapper(token, dto, "summary");
    }
    generateQuestions(token, dto) {
        return this.platform.aiWrapper(token, dto, "questions");
    }
    translate(token, dto) {
        return this.platform.aiWrapper(token, dto, "translate");
    }
    generateTeacherTest(token, dto) {
        return this.platform.aiTeacherGenerateTest(token, dto);
    }
    uploadFile(user, file) {
        return this.platform.handleUploadedFile(user, file);
    }
    getFile(user, id) {
        return this.platform.getFile(user, id);
    }
    notifications(user, query) {
        return this.platform.notifications(user, query);
    }
    readAllNotifications(user) {
        return this.platform.readAllNotifications(user);
    }
    readNotification(user, id) {
        return this.platform.readNotification(user, id);
    }
    createReview(user, courseId, dto) {
        return this.platform.createReview(user, courseId, dto);
    }
    listReviews(courseId) {
        return this.platform.listReviews(courseId);
    }
    adminUsers(query) {
        return this.platform.listUsers(query);
    }
    adminRole(user, id, dto) {
        return this.platform.updateUserRole(user, id, dto);
    }
    adminStatus(user, id, dto) {
        return this.platform.updateUserStatus(user, id, dto);
    }
    adminCourses(query) {
        return this.platform.adminCourses(query);
    }
    auditLogs(query) {
        return this.platform.auditLogs(query);
    }
    adminAiHistory(token, query) {
        return this.platform.aiHistory(token, query);
    }
    adminDashboard() {
        return this.platform.adminDashboard();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)("health"),
    (0, swagger_1.ApiOperation)({ summary: "Liveness probe" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "health", null);
__decorate([
    (0, common_1.Post)("auth/register"),
    (0, swagger_1.ApiOperation)({ summary: "Register student account" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("auth/login"),
    (0, swagger_1.ApiOperation)({ summary: "Login with email and password" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Get)("auth/me"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get current authenticated user" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "authMe", null);
__decorate([
    (0, common_1.Post)("auth/logout"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Logout current session" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("auth/refresh"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Prepared refresh endpoint for Stage 2 token rotation" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)("users/me"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get profile" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "me", null);
__decorate([
    (0, common_1.Put)("users/me"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update profile" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Put)("users/me/language"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update preferred language" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateLanguageDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateLanguage", null);
__decorate([
    (0, common_1.Get)("categories"),
    (0, swagger_1.ApiOperation)({ summary: "List course categories" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "categories", null);
__decorate([
    (0, common_1.Post)("admin/categories"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create category" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Put)("admin/categories/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update category" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Get)("courses"),
    (0, swagger_1.ApiOperation)({ summary: "List course catalog" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "courses", null);
__decorate([
    (0, common_1.Get)("teacher/courses"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List manageable courses" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "teacherCourses", null);
__decorate([
    (0, common_1.Post)("courses"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create course" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateCourseDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Put)("courses/:id/publish"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Publish course" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "publishCourse", null);
__decorate([
    (0, common_1.Put)("courses/:id/archive"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Archive course" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "archiveCourse", null);
__decorate([
    (0, common_1.Put)("courses/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update course" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateCourseDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)("courses/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Soft delete course" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)("courses/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get course card" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getCourse", null);
__decorate([
    (0, common_1.Post)("courses/:courseId/materials"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create material" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreateMaterialDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createMaterial", null);
__decorate([
    (0, common_1.Get)("courses/:courseId/materials"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List course materials" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "listMaterials", null);
__decorate([
    (0, common_1.Get)("materials/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get material" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getMaterial", null);
__decorate([
    (0, common_1.Put)("materials/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update material" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateMaterialDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateMaterial", null);
__decorate([
    (0, common_1.Delete)("materials/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Soft delete material" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteMaterial", null);
__decorate([
    (0, common_1.Post)("materials/:id/complete"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("STUDENT"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Mark material completed" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "completeMaterial", null);
__decorate([
    (0, common_1.Post)("enrollments"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("STUDENT"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Enroll student to course" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.EnrollmentDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)("enrollments/my"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("STUDENT"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List my courses" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "myEnrollments", null);
__decorate([
    (0, common_1.Get)("courses/:courseId/students"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List students enrolled to course" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "courseStudents", null);
__decorate([
    (0, common_1.Post)("courses/:courseId/tests"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create test" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreateTestDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createTest", null);
__decorate([
    (0, common_1.Get)("courses/:courseId/tests"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List course tests" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "listTests", null);
__decorate([
    (0, common_1.Get)("tests/:testId"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get test" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("testId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getTest", null);
__decorate([
    (0, common_1.Post)("tests/:testId/questions"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create SINGLE question" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("testId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreateQuestionDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Post)("tests/:testId/submit"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("STUDENT"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Submit test attempt" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("testId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.SubmitTestDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "submitTest", null);
__decorate([
    (0, common_1.Get)("tests/:testId/attempts/my"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("STUDENT"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List my test attempts" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("testId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "myAttempts", null);
__decorate([
    (0, common_1.Get)("tests/:testId/attempts"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List test attempts for teacher/admin" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("testId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "testAttempts", null);
__decorate([
    (0, common_1.Get)("progress/:courseId"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get my course progress" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Get)("courses/:courseId/progress"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get course student progress" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "courseProgress", null);
__decorate([
    (0, common_1.Post)("ai/chat"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Ask AI assistant" }),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AiChatDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "aiChat", null);
__decorate([
    (0, common_1.Get)("ai/history"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List AI request history" }),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "aiHistory", null);
__decorate([
    (0, common_1.Post)("ai/summarize-material"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "AI material summary" }),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AiChatDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "summarize", null);
__decorate([
    (0, common_1.Post)("ai/generate-questions"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "AI question generation" }),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AiChatDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "generateQuestions", null);
__decorate([
    (0, common_1.Post)("ai/translate"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "AI translation" }),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AiChatDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "translate", null);
__decorate([
    (0, common_1.Post)("ai/teacher/generate-test"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("TEACHER", "ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "AI test generator for teachers" }),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.GenerateTestDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "generateTeacherTest", null);
__decorate([
    (0, common_1.Post)("files/upload"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
            destination: uploadDir,
            filename: (_req, file, callback) => {
                const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                callback(null, `${suffix}${(0, node_path_1.extname)(file.originalname).toLowerCase()}`);
            }
        })
    })),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: { file: { type: "string", format: "binary" } }
        }
    }),
    (0, swagger_1.ApiOperation)({ summary: "Upload PDF or image" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)("files/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get file metadata" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)("notifications"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List notifications" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "notifications", null);
__decorate([
    (0, common_1.Put)("notifications/read-all"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Mark all notifications as read" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "readAllNotifications", null);
__decorate([
    (0, common_1.Put)("notifications/:id/read"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Mark notification as read" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "readNotification", null);
__decorate([
    (0, common_1.Post)("courses/:courseId/reviews"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("STUDENT"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create or update course review" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("courseId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.ReviewDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)("courses/:courseId/reviews"),
    (0, swagger_1.ApiOperation)({ summary: "List course reviews" }),
    __param(0, (0, common_1.Param)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "listReviews", null);
__decorate([
    (0, common_1.Get)("admin/users"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Admin list users" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "adminUsers", null);
__decorate([
    (0, common_1.Put)("admin/users/:id/role"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Admin change user role" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateRoleDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "adminRole", null);
__decorate([
    (0, common_1.Put)("admin/users/:id/status"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Admin change user status" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateStatusDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "adminStatus", null);
__decorate([
    (0, common_1.Get)("admin/courses"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Admin list all courses" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "adminCourses", null);
__decorate([
    (0, common_1.Get)("admin/audit-logs"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Admin list audit logs" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "auditLogs", null);
__decorate([
    (0, common_1.Get)("admin/ai-history"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Admin list AI history" }),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "adminAiHistory", null);
__decorate([
    (0, common_1.Get)("admin/dashboard"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Admin dashboard metrics" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "adminDashboard", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)("QazaqLearn"),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [platform_service_1.PlatformService])
], AppController);
//# sourceMappingURL=app.controller.js.map