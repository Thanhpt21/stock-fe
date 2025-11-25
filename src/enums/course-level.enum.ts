export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate', 
  ADVANCED = 'advanced'
}

export const CourseLevelDisplay = {
  [CourseLevel.BEGINNER]: 'Cơ bản',
  [CourseLevel.INTERMEDIATE]: 'Trung cấp', 
  [CourseLevel.ADVANCED]: 'Nâng cao'
} as const;

export type CourseLevelType = keyof typeof CourseLevel;

export const CourseLevelValues = Object.values(CourseLevel) as CourseLevel[];

export const isValidCourseLevel = (level: string): level is CourseLevel => {
  return CourseLevelValues.includes(level as CourseLevel);
};