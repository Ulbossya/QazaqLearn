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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateTestDto = exports.UuidParamDto = exports.ReviewDto = exports.AiChatDto = exports.SubmitTestDto = exports.TestAnswerDto = exports.CreateQuestionDto = exports.QuestionOptionDto = exports.CreateTestDto = exports.EnrollmentDto = exports.UpdateMaterialDto = exports.CreateMaterialDto = exports.UpdateCourseDto = exports.CreateCourseDto = exports.CreateCategoryDto = exports.UpdateStatusDto = exports.UpdateRoleDto = exports.UpdateLanguageDto = exports.UpdateProfileDto = exports.LoginDto = exports.RegisterDto = exports.PaginationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class PaginationDto {
    page = 1;
    limit = 20;
    search;
    sort = "createdAt";
    order = "desc";
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaginationDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: "createdAt" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaginationDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ["asc", "desc"], default: "desc" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["asc", "desc"]),
    __metadata("design:type", String)
], PaginationDto.prototype, "order", void 0);
class RegisterDto {
    email;
    password;
    fullName;
    preferredLanguage;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "student@example.com" }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Student123!" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Student Demo" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ["ru", "kz"], example: "ru" }),
    (0, class_validator_1.IsIn)(["ru", "kz"]),
    __metadata("design:type", String)
], RegisterDto.prototype, "preferredLanguage", void 0);
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "student@example.com" }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Student123!" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class UpdateProfileDto {
    fullName;
    preferredLanguage;
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ["ru", "kz"] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["ru", "kz"]),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "preferredLanguage", void 0);
class UpdateLanguageDto {
    preferredLanguage;
}
exports.UpdateLanguageDto = UpdateLanguageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ["ru", "kz"] }),
    (0, class_validator_1.IsIn)(["ru", "kz"]),
    __metadata("design:type", String)
], UpdateLanguageDto.prototype, "preferredLanguage", void 0);
class UpdateRoleDto {
    role;
}
exports.UpdateRoleDto = UpdateRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.Role }),
    (0, class_validator_1.IsEnum)(client_1.Role),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "role", void 0);
class UpdateStatusDto {
    status;
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.UserStatus }),
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
class CreateCategoryDto {
    nameRu;
    nameKz;
    slug;
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "nameRu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "nameKz", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 80),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "slug", void 0);
class CreateCourseDto {
    titleRu;
    titleKz;
    descriptionRu;
    descriptionKz;
    categoryId;
    price;
}
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Основы JavaScript" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "titleRu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "JavaScript негіздері" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "titleKz", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Базовый курс" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "descriptionRu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Базалық курс" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "descriptionKz", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "price", void 0);
class UpdateCourseDto extends CreateCourseDto {
}
exports.UpdateCourseDto = UpdateCourseDto;
class CreateMaterialDto {
    titleRu;
    titleKz;
    type;
    contentRu;
    contentKz;
    fileUrl;
    videoUrl;
    orderIndex;
}
exports.CreateMaterialDto = CreateMaterialDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Введение" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "titleRu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Кіріспе" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "titleKz", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MaterialType }),
    (0, class_validator_1.IsEnum)(client_1.MaterialType),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "contentRu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "contentKz", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMaterialDto.prototype, "orderIndex", void 0);
class UpdateMaterialDto extends CreateMaterialDto {
}
exports.UpdateMaterialDto = UpdateMaterialDto;
class EnrollmentDto {
    courseId;
}
exports.EnrollmentDto = EnrollmentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EnrollmentDto.prototype, "courseId", void 0);
class CreateTestDto {
    titleRu;
    titleKz;
    durationMinutes;
    passScore;
}
exports.CreateTestDto = CreateTestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Итоговый тест" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "titleRu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Қорытынды тест" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "titleKz", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTestDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 70 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateTestDto.prototype, "passScore", void 0);
class QuestionOptionDto {
    key;
    textRu;
    textKz;
}
exports.QuestionOptionDto = QuestionOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuestionOptionDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuestionOptionDto.prototype, "textRu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuestionOptionDto.prototype, "textKz", void 0);
class CreateQuestionDto {
    questionTextRu;
    questionTextKz;
    type;
    options;
    correctAnswer;
    points;
}
exports.CreateQuestionDto = CreateQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "questionTextRu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "questionTextKz", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.QuestionType }),
    (0, class_validator_1.IsEnum)(client_1.QuestionType),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [QuestionOptionDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(2),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QuestionOptionDto),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "correctAnswer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuestionDto.prototype, "points", void 0);
class TestAnswerDto {
    questionId;
    answer;
}
exports.TestAnswerDto = TestAnswerDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TestAnswerDto.prototype, "questionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestAnswerDto.prototype, "answer", void 0);
class SubmitTestDto {
    answers;
}
exports.SubmitTestDto = SubmitTestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TestAnswerDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TestAnswerDto),
    __metadata("design:type", Array)
], SubmitTestDto.prototype, "answers", void 0);
class AiChatDto {
    courseId;
    materialId;
    message;
    language;
}
exports.AiChatDto = AiChatDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AiChatDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AiChatDto.prototype, "materialId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 4000),
    __metadata("design:type", String)
], AiChatDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ["ru", "kz"] }),
    (0, class_validator_1.IsIn)(["ru", "kz"]),
    __metadata("design:type", String)
], AiChatDto.prototype, "language", void 0);
class ReviewDto {
    rating;
    comment;
}
exports.ReviewDto = ReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 1, maximum: 5 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewDto.prototype, "comment", void 0);
class UuidParamDto {
    id;
}
exports.UuidParamDto = UuidParamDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UuidParamDto.prototype, "id", void 0);
class GenerateTestDto {
    courseId;
    materialId;
    count;
    language;
    questionType;
    topic;
}
exports.GenerateTestDto = GenerateTestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "materialId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 1, maximum: 20, example: 5 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], GenerateTestDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ["ru", "kz"] }),
    (0, class_validator_1.IsIn)(["ru", "kz"]),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ["SINGLE", "MULTIPLE", "MIXED"] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["SINGLE", "MULTIPLE", "MIXED"]),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "questionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "topic", void 0);
//# sourceMappingURL=dto.js.map