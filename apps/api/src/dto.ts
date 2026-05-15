import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";
import { MaterialType, QuestionType, Role, UserStatus } from "@prisma/client";

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: "createdAt" })
  @IsOptional()
  @IsString()
  sort?: string = "createdAt";

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc" = "desc";
}

export class RegisterDto {
  @ApiProperty({ example: "student@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Student123!" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: "Student Demo" })
  @IsString()
  @Length(2, 100)
  fullName!: string;

  @ApiProperty({ enum: ["ru", "kz"], example: "ru" })
  @IsIn(["ru", "kz"])
  preferredLanguage!: string;
}

export class LoginDto {
  @ApiProperty({ example: "student@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Student123!" })
  @IsString()
  password!: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  fullName?: string;

  @ApiPropertyOptional({ enum: ["ru", "kz"] })
  @IsOptional()
  @IsIn(["ru", "kz"])
  preferredLanguage?: string;
}

export class UpdateLanguageDto {
  @ApiProperty({ enum: ["ru", "kz"] })
  @IsIn(["ru", "kz"])
  preferredLanguage!: string;
}

export class UpdateRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status!: UserStatus;
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @Length(2, 100)
  nameRu!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  nameKz!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 80)
  slug!: string;
}

export class CreateCourseDto {
  @ApiPropertyOptional({ example: "Основы JavaScript" })
  @IsOptional()
  @IsString()
  titleRu?: string;

  @ApiPropertyOptional({ example: "JavaScript негіздері" })
  @IsOptional()
  @IsString()
  titleKz?: string;

  @ApiPropertyOptional({ example: "Базовый курс" })
  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @ApiPropertyOptional({ example: "Базалық курс" })
  @IsOptional()
  @IsString()
  descriptionKz?: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

export class UpdateCourseDto extends CreateCourseDto {}

export class CreateMaterialDto {
  @ApiPropertyOptional({ example: "Введение" })
  @IsOptional()
  @IsString()
  titleRu?: string;

  @ApiPropertyOptional({ example: "Кіріспе" })
  @IsOptional()
  @IsString()
  titleKz?: string;

  @ApiProperty({ enum: MaterialType })
  @IsEnum(MaterialType)
  type!: MaterialType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentRu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentKz?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderIndex!: number;
}

export class UpdateMaterialDto extends CreateMaterialDto {}

export class EnrollmentDto {
  @ApiProperty()
  @IsUUID()
  courseId!: string;
}

export class CreateTestDto {
  @ApiPropertyOptional({ example: "Итоговый тест" })
  @IsOptional()
  @IsString()
  titleRu?: string;

  @ApiPropertyOptional({ example: "Қорытынды тест" })
  @IsOptional()
  @IsString()
  titleKz?: string;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @ApiProperty({ example: 70 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  passScore!: number;
}

export class QuestionOptionDto {
  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty()
  @IsString()
  textRu!: string;

  @ApiProperty()
  @IsString()
  textKz!: string;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  questionTextRu!: string;

  @ApiProperty()
  @IsString()
  questionTextKz!: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type!: QuestionType;

  @ApiProperty({ type: [QuestionOptionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @ApiProperty()
  @IsString()
  correctAnswer!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  points!: number;
}

export class TestAnswerDto {
  @ApiProperty()
  @IsUUID()
  questionId!: string;

  @ApiProperty()
  @IsString()
  answer!: string;
}

export class SubmitTestDto {
  @ApiProperty({ type: [TestAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestAnswerDto)
  answers!: TestAnswerDto[];
}

export class AiChatDto {
  @ApiProperty()
  @IsUUID()
  courseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @ApiProperty()
  @IsString()
  @Length(2, 4000)
  message!: string;

  @ApiProperty({ enum: ["ru", "kz"] })
  @IsIn(["ru", "kz"])
  language!: string;
}

export class ReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UuidParamDto {
  @ApiProperty()
  @IsUUID()
  id!: string;
}

export class GenerateTestDto {
  @ApiProperty()
  @IsUUID()
  courseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @ApiProperty({ minimum: 1, maximum: 20, example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  count!: number;

  @ApiProperty({ enum: ["ru", "kz"] })
  @IsIn(["ru", "kz"])
  language!: string;

  @ApiPropertyOptional({ enum: ["SINGLE", "MULTIPLE", "MIXED"] })
  @IsOptional()
  @IsIn(["SINGLE", "MULTIPLE", "MIXED"])
  questionType?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  topic?: string;
}
