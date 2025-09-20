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
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(1, "description is required"),
  current: z.boolean().default(false)
}).refine((data) => {
  if (!data.current && !data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date is required unless this is your current position",
  path: ["endDate"],
});

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Summary is required"),
  skills: z.string().min(1, "Skills is required"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});