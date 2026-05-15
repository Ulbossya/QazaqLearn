import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(email: string, fullName: string, role: Role, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { fullName, role, passwordHash, status: "ACTIVE" },
    create: { email, fullName, role, passwordHash, preferredLanguage: "ru" }
  });
}

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0 && process.env.FORCE_SEED !== "true") return;

  const admin = await upsertUser("admin@qazaqlearn.kz", "QazaqLearn Admin", "ADMIN", "Admin123!");
  const teacher = await upsertUser("teacher@qazaqlearn.kz", "Teacher Demo", "TEACHER", "Teacher123!");
  const student = await upsertUser("student@qazaqlearn.kz", "Student Demo", "STUDENT", "Student123!");

  const categories = await Promise.all([
    prisma.courseCategory.upsert({
      where: { slug: "programming" },
      update: { nameRu: "Программирование", nameKz: "Бағдарламалау" },
      create: { slug: "programming", nameRu: "Программирование", nameKz: "Бағдарламалау" }
    }),
    prisma.courseCategory.upsert({
      where: { slug: "languages" },
      update: { nameRu: "Языки", nameKz: "Тілдер" },
      create: { slug: "languages", nameRu: "Языки", nameKz: "Тілдер" }
    }),
    prisma.courseCategory.upsert({
      where: { slug: "math" },
      update: { nameRu: "Математика", nameKz: "Математика" },
      create: { slug: "math", nameRu: "Математика", nameKz: "Математика" }
    })
  ]);

  await prisma.course.deleteMany({ where: { teacherId: teacher.id } });

  const jsCourse = await prisma.course.create({
    data: {
      teacherId: teacher.id,
      categoryId: categories[0].id,
      titleRu: "Основы JavaScript",
      titleKz: "JavaScript негіздері",
      descriptionRu: "Базовый курс по JavaScript для начинающих.",
      descriptionKz: "Жаңадан бастаушыларға арналған JavaScript базалық курсы.",
      price: 0,
      status: "PUBLISHED",
      createdBy: teacher.id,
      updatedBy: teacher.id
    }
  });

  const kazCourse = await prisma.course.create({
    data: {
      teacherId: teacher.id,
      categoryId: categories[1].id,
      titleRu: "Казахский язык для начинающих",
      titleKz: "Жаңадан бастаушыларға қазақ тілі",
      descriptionRu: "Практический курс с короткими материалами и самопроверкой.",
      descriptionKz: "Қысқа материалдар мен өзін-өзі тексеруге арналған практикалық курс.",
      price: 0,
      status: "PUBLISHED",
      createdBy: teacher.id,
      updatedBy: teacher.id
    }
  });

  await prisma.course.create({
    data: {
      teacherId: teacher.id,
      categoryId: categories[2].id,
      titleRu: "Алгебра: черновик",
      titleKz: "Алгебра: жоба",
      descriptionRu: "Черновик курса для проверки публикации.",
      descriptionKz: "Жариялау ережелерін тексеруге арналған курс жобасы.",
      price: 0,
      status: "DRAFT",
      createdBy: teacher.id,
      updatedBy: teacher.id
    }
  });

  const demoCourses = [jsCourse, kazCourse];
  for (const course of demoCourses) {
    await prisma.courseMaterial.createMany({
      data: [
        {
          courseId: course.id,
          titleRu: "Введение",
          titleKz: "Кіріспе",
          type: "TEXT",
          contentRu: "Краткое введение в тему курса и ожидаемые результаты.",
          contentKz: "Курс тақырыбы мен күтілетін нәтижелерге қысқаша кіріспе.",
          orderIndex: 1,
          createdBy: teacher.id,
          updatedBy: teacher.id
        },
        {
          courseId: course.id,
          titleRu: "Основные понятия",
          titleKz: "Негізгі ұғымдар",
          type: "TEXT",
          contentRu: "Ключевые термины и простые примеры для закрепления.",
          contentKz: "Негізгі терминдер және бекітуге арналған қарапайым мысалдар.",
          orderIndex: 2,
          createdBy: teacher.id,
          updatedBy: teacher.id
        },
        {
          courseId: course.id,
          titleRu: "Практика",
          titleKz: "Тәжірибе",
          type: "VIDEO_URL",
          contentRu: "Практическое задание и вопросы для самопроверки.",
          contentKz: "Практикалық тапсырма және өзін-өзі тексеру сұрақтары.",
          videoUrl: "https://example.com/demo-video",
          orderIndex: 3,
          createdBy: teacher.id,
          updatedBy: teacher.id
        }
      ]
    });
  }

  const test = await prisma.courseTest.create({
    data: {
      courseId: jsCourse.id,
      titleRu: "Итоговый тест",
      titleKz: "Қорытынды тест",
      durationMinutes: 30,
      passScore: 70,
      createdBy: teacher.id,
      updatedBy: teacher.id
    }
  });

  const questions = [
    ["Что такое JavaScript?", "JavaScript деген не?", "A"],
    ["Где выполняется JavaScript в браузере?", "JavaScript браузерде қайда орындалады?", "B"],
    ["Как объявить константу?", "Тұрақтыны қалай жариялайды?", "A"],
    ["Что возвращает true && false?", "true && false нені қайтарады?", "B"],
    ["Какой тип у строки?", "Жолдың типі қандай?", "A"]
  ];

  await prisma.testQuestion.createMany({
    data: questions.map(([questionTextRu, questionTextKz, correctAnswer]) => ({
      testId: test.id,
      questionTextRu,
      questionTextKz,
      type: "SINGLE",
      options: [
        { key: "A", textRu: "Правильный учебный вариант", textKz: "Дұрыс оқу нұсқасы" },
        { key: "B", textRu: "Отвлекающий вариант", textKz: "Алаңдататын нұсқа" }
      ],
      correctAnswer,
      points: 1,
      createdBy: teacher.id,
      updatedBy: teacher.id
    }))
  });

  await prisma.enrollment.create({
    data: { courseId: jsCourse.id, studentId: student.id, status: "ACTIVE" }
  });

  await prisma.progress.create({
    data: {
      courseId: jsCourse.id,
      studentId: student.id,
      completedMaterials: 0,
      totalMaterials: 3,
      passedTests: 0,
      totalTests: 1,
      percent: 0
    }
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      type: "ENROLLMENT_CREATED",
      titleRu: "Вы записаны на курс",
      titleKz: "Сіз курсқа жазылдыңыз",
      messageRu: "Курс Основы JavaScript добавлен в мои курсы.",
      messageKz: "JavaScript негіздері курсы менің курстарыма қосылды."
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "COURSE_CREATED",
      entityType: "Course",
      entityId: jsCourse.id,
      metadata: { seed: true }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
