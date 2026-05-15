import { MaterialType, QuestionType, Role, UserStatus } from "@prisma/client";
export declare class PaginationDto {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
}
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    preferredLanguage: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class UpdateProfileDto {
    fullName?: string;
    preferredLanguage?: string;
}
export declare class UpdateLanguageDto {
    preferredLanguage: string;
}
export declare class UpdateRoleDto {
    role: Role;
}
export declare class UpdateStatusDto {
    status: UserStatus;
}
export declare class CreateCategoryDto {
    nameRu: string;
    nameKz: string;
    slug: string;
}
export declare class CreateCourseDto {
    titleRu?: string;
    titleKz?: string;
    descriptionRu?: string;
    descriptionKz?: string;
    categoryId: string;
    price: number;
}
export declare class UpdateCourseDto extends CreateCourseDto {
}
export declare class CreateMaterialDto {
    titleRu?: string;
    titleKz?: string;
    type: MaterialType;
    contentRu?: string;
    contentKz?: string;
    fileUrl?: string;
    videoUrl?: string;
    orderIndex: number;
}
export declare class UpdateMaterialDto extends CreateMaterialDto {
}
export declare class EnrollmentDto {
    courseId: string;
}
export declare class CreateTestDto {
    titleRu?: string;
    titleKz?: string;
    durationMinutes: number;
    passScore: number;
}
export declare class QuestionOptionDto {
    key: string;
    textRu: string;
    textKz: string;
}
export declare class CreateQuestionDto {
    questionTextRu: string;
    questionTextKz: string;
    type: QuestionType;
    options: QuestionOptionDto[];
    correctAnswer: string;
    points: number;
}
export declare class TestAnswerDto {
    questionId: string;
    answer: string;
}
export declare class SubmitTestDto {
    answers: TestAnswerDto[];
}
export declare class AiChatDto {
    courseId: string;
    materialId?: string;
    message: string;
    language: string;
}
export declare class ReviewDto {
    rating: number;
    comment?: string;
}
export declare class UuidParamDto {
    id: string;
}
export declare class GenerateTestDto {
    courseId: string;
    materialId?: string;
    count: number;
    language: string;
    questionType?: string;
    topic?: string;
}
