import z, { email } from "zod";

export const onboardingSchema = z.object({
  industry: z
    .string({ required_error: "Please select an industry" })
    .min(1, "Please select an industry"),

  subIndustry: z
    .string({ required_error: "Please select a specialization" })
    .min(1, "Please select a specialization"),

  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),

  experience: z
    .string()
    .min(1, "Please enter your years of experience")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience cannot exceed 50 years")
    ),

  skills: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
        : []
    ),
});


export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

export const entrySchema = z.object({
  title: z.string().min(1, "Required"),
  organization: z.string().min(1, "Required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().min(1, "Required"),
  current: z.boolean().optional(),
  link: z.string().url().optional().or(z.literal("")).optional(),
  period: z.string().optional(),
});

export const resumeSchema = z.object({
  contactInfo: z.object({
    email: z.string().email().optional(),
    mobile: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal("")).optional(),
    github: z.string().url().optional().or(z.literal("")).optional(),
  }),
  education: z
    .array(
      z.object({
        institution: z.string().min(1, "Institution is required"),
        degree: z.string().optional(),
        gpa: z.string().optional(),
        location: z.string().optional(),
        period: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  skillsSummary: z.object({
    languages: z.string().optional(),
    frameworks: z.string().optional(),
    tools: z.string().optional(),
    platforms: z.string().optional(),
    softSkills: z.string().optional(),
  }),
  experience: z.array(entrySchema).optional().default([]),
  projects: z
    .array(
      z.object({
        title: z.string().min(1, "Title required"),
        link: z.string().url().optional().or(z.literal("")).optional(),
        period: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  certificates: z
    .array(
      z.object({
        title: z.string().min(1, "Title required"),
        link: z.string().url().optional().or(z.literal("")).optional(),
        period: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});