export declare class AppError extends Error {
    readonly code: string;
    readonly messageRu: string;
    readonly messageKz: string;
    readonly statusCode: number;
    constructor(code: string, messageRu: string, messageKz: string, statusCode?: number);
}
export declare const Errors: {
    validation: () => AppError;
    unauthorized: () => AppError;
    forbidden: () => AppError;
    userNotFound: () => AppError;
    userBlocked: () => AppError;
    courseNotFound: () => AppError;
    courseNotPublished: () => AppError;
    notEnrolled: () => AppError;
    alreadyEnrolled: () => AppError;
    materialNotFound: () => AppError;
    testNotFound: () => AppError;
    aiRateLimit: () => AppError;
    aiUnavailable: () => AppError;
    fileTooLarge: () => AppError;
    unsupportedFileType: () => AppError;
};
