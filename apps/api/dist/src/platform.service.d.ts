import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { PaginationQuery } from "./common/pagination";
import { PrismaService } from "./prisma.service";
import { AuthUser } from "./auth/current-user.decorator";
import { AiChatDto, CreateCategoryDto, CreateCourseDto, CreateMaterialDto, CreateQuestionDto, CreateTestDto, EnrollmentDto, GenerateTestDto, LoginDto, RegisterDto, ReviewDto, SubmitTestDto, UpdateCourseDto, UpdateLanguageDto, UpdateMaterialDto, UpdateProfileDto, UpdateRoleDto, UpdateStatusDto } from "./dto";
export declare function aiServiceBaseUrl(): string;
export declare function buildAiUrl(path: string): string;
export declare class PlatformService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        tokenType: string;
        userId: string;
        role: import("@prisma/client").$Enums.Role;
        preferredLanguage: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        tokenType: string;
        userId: string;
        role: import("@prisma/client").$Enums.Role;
        preferredLanguage: string;
    }>;
    logout(): {
        loggedOut: boolean;
    };
    refresh(user: AuthUser): {
        accessToken: string;
        tokenType: string;
        userId: string;
        role: import("@prisma/client").$Enums.Role;
        preferredLanguage: string;
    };
    me(user: AuthUser): Promise<Omit<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        preferredLanguage: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    updateMe(user: AuthUser, dto: UpdateProfileDto): Promise<Omit<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        preferredLanguage: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    updateLanguage(user: AuthUser, dto: UpdateLanguageDto): Promise<Omit<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        preferredLanguage: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    listUsers(query: PaginationQuery): Promise<{
        items: {
            id: string;
            email: string;
            fullName: string;
            preferredLanguage: string;
            role: import("@prisma/client").$Enums.Role;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUserRole(actor: AuthUser, id: string, dto: UpdateRoleDto): Promise<Omit<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        preferredLanguage: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    updateUserStatus(actor: AuthUser, id: string, dto: UpdateStatusDto): Promise<Omit<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        preferredLanguage: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    listCategories(): Promise<{
        id: string;
        createdAt: Date;
        nameRu: string;
        nameKz: string;
        slug: string;
    }[]>;
    createCategory(actor: AuthUser, dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        nameRu: string;
        nameKz: string;
        slug: string;
    }>;
    updateCategory(actor: AuthUser, id: string, dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        nameRu: string;
        nameKz: string;
        slug: string;
    }>;
    listCourses(user: AuthUser | undefined, query: PaginationQuery & {
        categoryId?: string;
        status?: string;
    }): Promise<{
        items: {
            averageRating: number | null;
            reviews: {
                id: string;
                createdAt: Date;
                courseId: string;
                rating: number;
                comment: string | null;
                studentId: string;
            }[];
            teacher: {
                id: string;
                fullName: string;
            };
            category: {
                id: string;
                createdAt: Date;
                nameRu: string;
                nameKz: string;
                slug: string;
            };
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            descriptionRu: string | null;
            descriptionKz: string | null;
            categoryId: string;
            price: number;
            teacherId: string;
            createdBy: string | null;
            updatedBy: string | null;
            deletedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    listManageableCourses(user: AuthUser, query: PaginationQuery & {
        status?: string;
    }): Promise<{
        items: {
            averageRating: number | null;
            contentSummary: {
                materialCount: number;
                testCount: number;
                enrollmentCount: number;
            };
            teacher: {
                id: string;
                fullName: string;
            };
            category: {
                id: string;
                createdAt: Date;
                nameRu: string;
                nameKz: string;
                slug: string;
            };
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            descriptionRu: string | null;
            descriptionKz: string | null;
            categoryId: string;
            price: number;
            teacherId: string;
            createdBy: string | null;
            updatedBy: string | null;
            deletedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCourse(user: AuthUser, id: string): Promise<{
        contentSummary: {
            materialCount: number;
            testCount: number;
            questionCount: number;
        };
        studentProgress: {
            id: string;
            updatedAt: Date;
            courseId: string;
            completedMaterials: number;
            totalMaterials: number;
            passedTests: number;
            totalTests: number;
            studentId: string;
            percent: number;
        } | null;
        scoreSummary: {
            attemptedTests: number;
            passedLatestTests: number;
            latestAverageScore: number | null;
            bestScore: number | null;
        };
        studentEnrollment: {
            id: string;
            status: import("@prisma/client").$Enums.EnrollmentStatus;
            createdAt: Date;
            courseId: string;
            studentId: string;
            completedAt: Date | null;
        } | null;
        reviews: {
            id: string;
            createdAt: Date;
            courseId: string;
            rating: number;
            comment: string | null;
            studentId: string;
        }[];
        teacher: {
            id: string;
            fullName: string;
        };
        category: {
            id: string;
            createdAt: Date;
            nameRu: string;
            nameKz: string;
            slug: string;
        };
        materials: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.MaterialType;
            titleRu: string | null;
            titleKz: string | null;
            contentRu: string | null;
            contentKz: string | null;
            fileUrl: string | null;
            videoUrl: string | null;
            orderIndex: number;
            courseId: string;
            createdBy: string | null;
            updatedBy: string | null;
            isDeleted: boolean;
        }[];
        tests: ({
            questions: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.QuestionType;
                questionTextRu: string | null;
                questionTextKz: string | null;
                options: Prisma.JsonValue;
                correctAnswer: string;
                points: number;
                createdBy: string | null;
                updatedBy: string | null;
                testId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            courseId: string;
            durationMinutes: number;
            passScore: number;
            createdBy: string | null;
            updatedBy: string | null;
        })[];
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        descriptionRu: string | null;
        descriptionKz: string | null;
        categoryId: string;
        price: number;
        teacherId: string;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    } | {
        contentSummary: {
            materialCount: number;
            testCount: number;
            questionCount: number;
        };
        managementSummary: {
            enrollmentCount: number;
            completedStudents: number;
            averageProgress: number;
        };
        reviews: {
            id: string;
            createdAt: Date;
            courseId: string;
            rating: number;
            comment: string | null;
            studentId: string;
        }[];
        teacher: {
            id: string;
            fullName: string;
        };
        category: {
            id: string;
            createdAt: Date;
            nameRu: string;
            nameKz: string;
            slug: string;
        };
        materials: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.MaterialType;
            titleRu: string | null;
            titleKz: string | null;
            contentRu: string | null;
            contentKz: string | null;
            fileUrl: string | null;
            videoUrl: string | null;
            orderIndex: number;
            courseId: string;
            createdBy: string | null;
            updatedBy: string | null;
            isDeleted: boolean;
        }[];
        tests: ({
            questions: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.QuestionType;
                questionTextRu: string | null;
                questionTextKz: string | null;
                options: Prisma.JsonValue;
                correctAnswer: string;
                points: number;
                createdBy: string | null;
                updatedBy: string | null;
                testId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            courseId: string;
            durationMinutes: number;
            passScore: number;
            createdBy: string | null;
            updatedBy: string | null;
        })[];
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        descriptionRu: string | null;
        descriptionKz: string | null;
        categoryId: string;
        price: number;
        teacherId: string;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    createCourse(user: AuthUser, dto: CreateCourseDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        descriptionRu: string | null;
        descriptionKz: string | null;
        categoryId: string;
        price: number;
        teacherId: string;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    updateCourse(user: AuthUser, id: string, dto: UpdateCourseDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        descriptionRu: string | null;
        descriptionKz: string | null;
        categoryId: string;
        price: number;
        teacherId: string;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    publishCourse(user: AuthUser, id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        descriptionRu: string | null;
        descriptionKz: string | null;
        categoryId: string;
        price: number;
        teacherId: string;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    archiveCourse(user: AuthUser, id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        descriptionRu: string | null;
        descriptionKz: string | null;
        categoryId: string;
        price: number;
        teacherId: string;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    deleteCourse(user: AuthUser, id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        descriptionRu: string | null;
        descriptionKz: string | null;
        categoryId: string;
        price: number;
        teacherId: string;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    createMaterial(user: AuthUser, courseId: string, dto: CreateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.MaterialType;
        titleRu: string | null;
        titleKz: string | null;
        contentRu: string | null;
        contentKz: string | null;
        fileUrl: string | null;
        videoUrl: string | null;
        orderIndex: number;
        courseId: string;
        createdBy: string | null;
        updatedBy: string | null;
        isDeleted: boolean;
    }>;
    listMaterials(user: AuthUser, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.MaterialType;
        titleRu: string | null;
        titleKz: string | null;
        contentRu: string | null;
        contentKz: string | null;
        fileUrl: string | null;
        videoUrl: string | null;
        orderIndex: number;
        courseId: string;
        createdBy: string | null;
        updatedBy: string | null;
        isDeleted: boolean;
    }[]>;
    getMaterial(user: AuthUser, id: string): Promise<{
        course: {
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            descriptionRu: string | null;
            descriptionKz: string | null;
            categoryId: string;
            price: number;
            teacherId: string;
            createdBy: string | null;
            updatedBy: string | null;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.MaterialType;
        titleRu: string | null;
        titleKz: string | null;
        contentRu: string | null;
        contentKz: string | null;
        fileUrl: string | null;
        videoUrl: string | null;
        orderIndex: number;
        courseId: string;
        createdBy: string | null;
        updatedBy: string | null;
        isDeleted: boolean;
    }>;
    updateMaterial(user: AuthUser, id: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.MaterialType;
        titleRu: string | null;
        titleKz: string | null;
        contentRu: string | null;
        contentKz: string | null;
        fileUrl: string | null;
        videoUrl: string | null;
        orderIndex: number;
        courseId: string;
        createdBy: string | null;
        updatedBy: string | null;
        isDeleted: boolean;
    }>;
    deleteMaterial(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.MaterialType;
        titleRu: string | null;
        titleKz: string | null;
        contentRu: string | null;
        contentKz: string | null;
        fileUrl: string | null;
        videoUrl: string | null;
        orderIndex: number;
        courseId: string;
        createdBy: string | null;
        updatedBy: string | null;
        isDeleted: boolean;
    }>;
    completeMaterial(user: AuthUser, id: string): Promise<{
        id: string;
        materialId: string;
        studentId: string;
        completedAt: Date;
    }>;
    enroll(user: AuthUser, dto: EnrollmentDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        createdAt: Date;
        courseId: string;
        studentId: string;
        completedAt: Date | null;
    }>;
    myEnrollments(user: AuthUser): Promise<{
        progress: {
            id: string;
            updatedAt: Date;
            courseId: string;
            completedMaterials: number;
            totalMaterials: number;
            passedTests: number;
            totalTests: number;
            studentId: string;
            percent: number;
        } | null;
        scoreSummary: {
            attemptedTests: number;
            passedLatestTests: number;
            latestAverageScore: number | null;
            bestScore: number | null;
        };
        course: {
            category: {
                id: string;
                createdAt: Date;
                nameRu: string;
                nameKz: string;
                slug: string;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            descriptionRu: string | null;
            descriptionKz: string | null;
            categoryId: string;
            price: number;
            teacherId: string;
            createdBy: string | null;
            updatedBy: string | null;
            deletedAt: Date | null;
        };
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        createdAt: Date;
        courseId: string;
        studentId: string;
        completedAt: Date | null;
    }[]>;
    courseStudents(user: AuthUser, courseId: string, query: PaginationQuery): Promise<{
        items: {
            progress: {
                id: string;
                updatedAt: Date;
                courseId: string;
                completedMaterials: number;
                totalMaterials: number;
                passedTests: number;
                totalTests: number;
                studentId: string;
                percent: number;
            } | null;
            scoreSummary: {
                attemptedTests: number;
                passedLatestTests: number;
                latestAverageScore: number | null;
                bestScore: number | null;
            };
            student: {
                id: string;
                email: string;
                fullName: string;
            };
            id: string;
            status: import("@prisma/client").$Enums.EnrollmentStatus;
            createdAt: Date;
            courseId: string;
            studentId: string;
            completedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createTest(user: AuthUser, courseId: string, dto: CreateTestDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        courseId: string;
        durationMinutes: number;
        passScore: number;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    listTests(user: AuthUser, courseId: string): Promise<({
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.QuestionType;
            questionTextRu: string | null;
            questionTextKz: string | null;
            options: Prisma.JsonValue;
            correctAnswer: string;
            points: number;
            createdBy: string | null;
            updatedBy: string | null;
            testId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        courseId: string;
        durationMinutes: number;
        passScore: number;
        createdBy: string | null;
        updatedBy: string | null;
    })[]>;
    getTest(user: AuthUser, testId: string): Promise<{
        course: {
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            descriptionRu: string | null;
            descriptionKz: string | null;
            categoryId: string;
            price: number;
            teacherId: string;
            createdBy: string | null;
            updatedBy: string | null;
            deletedAt: Date | null;
        };
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.QuestionType;
            questionTextRu: string | null;
            questionTextKz: string | null;
            options: Prisma.JsonValue;
            correctAnswer: string;
            points: number;
            createdBy: string | null;
            updatedBy: string | null;
            testId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titleRu: string | null;
        titleKz: string | null;
        courseId: string;
        durationMinutes: number;
        passScore: number;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    createQuestion(user: AuthUser, testId: string, dto: CreateQuestionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.QuestionType;
        questionTextRu: string | null;
        questionTextKz: string | null;
        options: Prisma.JsonValue;
        correctAnswer: string;
        points: number;
        createdBy: string | null;
        updatedBy: string | null;
        testId: string;
    }>;
    submitTest(user: AuthUser, testId: string, dto: SubmitTestDto): Promise<{
        id: string;
        createdAt: Date;
        answers: Prisma.JsonValue;
        studentId: string;
        testId: string;
        score: number;
        passed: boolean;
    }>;
    myAttempts(user: AuthUser, testId: string): Promise<{
        id: string;
        createdAt: Date;
        answers: Prisma.JsonValue;
        studentId: string;
        testId: string;
        score: number;
        passed: boolean;
    }[]>;
    testAttempts(user: AuthUser, testId: string): Promise<({
        student: {
            id: string;
            email: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        answers: Prisma.JsonValue;
        studentId: string;
        testId: string;
        score: number;
        passed: boolean;
    })[]>;
    getProgress(user: AuthUser, courseId: string): Promise<{
        scoreSummary: {
            attemptedTests: number;
            passedLatestTests: number;
            latestAverageScore: number | null;
            bestScore: number | null;
        };
        id: string;
        updatedAt: Date;
        courseId: string;
        completedMaterials: number;
        totalMaterials: number;
        passedTests: number;
        totalTests: number;
        studentId: string;
        percent: number;
    }>;
    courseProgress(user: AuthUser, courseId: string): Promise<{
        scoreSummary: {
            attemptedTests: number;
            passedLatestTests: number;
            latestAverageScore: number | null;
            bestScore: number | null;
        };
        student: {
            id: string;
            email: string;
            fullName: string;
        };
        id: string;
        updatedAt: Date;
        courseId: string;
        completedMaterials: number;
        totalMaterials: number;
        passedTests: number;
        totalTests: number;
        studentId: string;
        percent: number;
    }[]>;
    aiChat(token: string, dto: AiChatDto): Promise<unknown>;
    aiWrapper(token: string, dto: AiChatDto, mode: "summary" | "questions" | "translate"): Promise<unknown>;
    aiHistory(token: string, query: PaginationQuery): Promise<unknown>;
    aiTeacherGenerateTest(token: string, dto: GenerateTestDto): Promise<unknown>;
    private forwardAi;
    handleUploadedFile(user: AuthUser, file?: Express.Multer.File): Promise<{
        id: string;
        fileUrl: string;
        fileName: string;
        contentType: string;
        size: number;
    }>;
    getFile(user: AuthUser, id: string): Promise<{
        sizeBytes: number;
        id: string;
        createdAt: Date;
        fileUrl: string;
        originalName: string;
        storedName: string;
        contentType: string;
        uploadedBy: string;
    }>;
    notifications(user: AuthUser, query: PaginationQuery): Promise<{
        items: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.NotificationType;
            titleRu: string;
            titleKz: string;
            messageRu: string;
            messageKz: string;
            isRead: boolean;
            userId: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    readNotification(user: AuthUser, id: string): Promise<{
        updated: number;
    }>;
    readAllNotifications(user: AuthUser): Promise<{
        updated: number;
    }>;
    createReview(user: AuthUser, courseId: string, dto: ReviewDto): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        rating: number;
        comment: string | null;
        studentId: string;
    }>;
    listReviews(courseId: string): Promise<({
        student: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        rating: number;
        comment: string | null;
        studentId: string;
    })[]>;
    adminCourses(query: PaginationQuery): Promise<{
        items: {
            teacher: Omit<{
                id: string;
                email: string;
                passwordHash: string;
                fullName: string;
                preferredLanguage: string;
                role: import("@prisma/client").$Enums.Role;
                status: import("@prisma/client").$Enums.UserStatus;
                createdAt: Date;
                updatedAt: Date;
            }, "passwordHash">;
            contentSummary: {
                materialCount: number;
                testCount: number;
                enrollmentCount: number;
            };
            category: {
                id: string;
                createdAt: Date;
                nameRu: string;
                nameKz: string;
                slug: string;
            };
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            titleRu: string | null;
            titleKz: string | null;
            descriptionRu: string | null;
            descriptionKz: string | null;
            categoryId: string;
            price: number;
            teacherId: string;
            createdBy: string | null;
            updatedBy: string | null;
            deletedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    auditLogs(query: PaginationQuery): Promise<{
        items: ({
            actor: {
                id: string;
                email: string;
                fullName: string;
                role: import("@prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            action: import("@prisma/client").$Enums.AuditAction;
            entityType: string;
            entityId: string | null;
            metadata: Prisma.JsonValue | null;
            actorId: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    adminDashboard(): Promise<{
        users: number;
        courses: number;
        aiRequests: number;
        auditLogs: {
            id: string;
            createdAt: Date;
            action: import("@prisma/client").$Enums.AuditAction;
            entityType: string;
            entityId: string | null;
            metadata: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        blockedUsers: number;
        todayActivity: number;
    }>;
    private loginResponse;
    private safeUser;
    private assertCourseText;
    private getCourseForManage;
    private assertCourseOwner;
    private assertCourseReadable;
    private assertEnrolled;
    private recalculateProgress;
    private getCourseScoreSummary;
    private audit;
    private notify;
}
