// app/(main)/components/ResumeBuilder.jsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Download, Loader2, Save } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { saveResume } from "@/actions/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EntryForm from "./EntryForm";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import ResumeTemplate from "./ResumeTemplate";

// Do not import html2pdf at top-level
const defaultValues = {
  contactInfo: {
    email: "",
    mobile: "",
    linkedin: "",
    github: "",
  },
  education: [
    // {
    //   institution: "",
    //   degree: "",
    //   gpa: "",
    //   location: "",
    //   period: "",
    // },
  ],
  skillsSummary: {
    languages: "",
    frameworks: "",
    tools: "",
    platforms: "",
    softSkills: "",
  },
  experience: [],
  projects: [],
  certificates: [],
};

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useUser();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues,
    mode: "onChange",
  });

  // Field arrays for sections
  const {
    fields: eduFields,
    append: eduAppend,
    remove: eduRemove,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: projFields,
    append: projAppend,
    remove: projRemove,
  } = useFieldArray({ control, name: "projects" });

  const {
    fields: certFields,
    append: certAppend,
    remove: certRemove,
  } = useFieldArray({ control, name: "certificates" });

  const values = watch();
  const { loading: isSaving, fn: saveResumeFn, data: saveResult, error: saveError } =
    useFetch(saveResume);

  useEffect(() => {
    if (saveResult && !isSaving) toast.success("Resume saved successfully!");
    if (saveError) toast.error(saveError.message || "Failed to save resume");
  }, [saveResult, saveError, isSaving]);

  const onSave = async () => {
    try {
      // Save the JSON snapshot (or stringify it if your action expects string)
      await saveResumeFn(JSON.stringify(values));
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      if (typeof window === "undefined") return;
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const element = document.getElementById("resume-pdf");
      if (!element) throw new Error("Printable element not found");

      const mod = await import("html2pdf.js");
      const html2pdf = mod.default || mod;

      await html2pdf()
        .set({
          margin: [10, 8, 10, 8],
          filename: "resume.pdf",
          image: { type: "jpeg", quality: 0.99 },
          html2canvas: {
            scale: 2.4,
            useCORS: true,
            letterRendering: true,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } catch (e) {
      console.error("PDF generation error:", e?.message || e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">Resume Builder</h1>
        <div className="space-x-2">
          <Button variant="destructive" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePdf} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Template Preview</TabsTrigger>
        </TabsList>

        {/* Edit Form */}
        <TabsContent value="edit">
          <form className="space-y-8">
            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Header / Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-black/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" {...register("contactInfo.email")} placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile</label>
                  <Input type="tel" {...register("contactInfo.mobile")} placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input type="url" {...register("contactInfo.linkedin")} placeholder="https://linkedin.com/in/you" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub/Behance URL</label>
                  <Input type="url" {...register("contactInfo.github")} placeholder="https://github.com/you" />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <div className="space-y-3">
                {eduFields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                    <Input className="md:col-span-2" placeholder="Institution"
                      {...register(`education.${i}.institution`)} />
                    <Input className="md:col-span-2" placeholder="Degree"
                      {...register(`education.${i}.degree`)} />
                    <Input className="md:col-span-1" placeholder="GPA (e.g., 8.06)"
                      {...register(`education.${i}.gpa`)} />
                    <Input className="md:col-span-1" placeholder="Location"
                      {...register(`education.${i}.location`)} />
                    <Input className="md:col-span-6" placeholder="Period (e.g., June 2022 - August 2024)"
                      {...register(`education.${i}.period`)} />
                    <div className="md:col-span-6">
                      <Button variant="outline" type="button" onClick={() => eduRemove(i)}>Remove</Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() =>
                  eduAppend({ institution: "", degree: "", gpa: "", location: "", period: "" })
                }>
                  Add Education
                </Button>
              </div>
            </div>

            {/* Skills Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Languages</label>
                  <Textarea rows={2} {...register("skillsSummary.languages")} placeholder="Python, SQL, Java" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Frameworks</label>
                  <Textarea rows={2} {...register("skillsSummary.frameworks")} placeholder="Pandas, Numpy, Scikit-learn, Matplotlib" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tools</label>
                  <Textarea rows={2} {...register("skillsSummary.tools")} placeholder="Power BI, Excel, PowerPoint, Tableau, MySQL, SQLite" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platforms</label>
                  <Textarea rows={2} {...register("skillsSummary.platforms")} placeholder="PyCharm, Jupyter, VS Code, IntelliJ IDEA" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Soft Skills</label>
                  <Textarea rows={2} {...register("skillsSummary.softSkills")} placeholder="Rapport Building, Stakeholder Management, Excellent communication" />
                </div>
              </div>
            </div>

            {/* Experience (reuse your EntryForm) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <div className="space-y-3">
                {projFields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                    <Input className="md:col-span-2" placeholder="Title" {...register(`projects.${i}.title`)} />
                    <Input className="md:col-span-2" placeholder="LINK URL" {...register(`projects.${i}.link`)} />
                    <Input className="md:col-span-2" placeholder="Period (e.g., Dec 2023 - Feb 2024)" {...register(`projects.${i}.period`)} />
                    <Textarea className="md:col-span-6" rows={4} placeholder="Bulleted lines (one per line)"
                      {...register(`projects.${i}.description`)} />
                    <div className="md:col-span-6">
                      <Button variant="outline" type="button" onClick={() => projRemove(i)}>Remove</Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() =>
                  projAppend({ title: "", link: "", period: "", description: "" })
                }>
                  Add Project
                </Button>
              </div>
            </div>

            {/* Certificates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Certificates</h3>
              <div className="space-y-3">
                {certFields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                    <Input className="md:col-span-3" placeholder="Title (org in brackets optional)"
                      {...register(`certificates.${i}.title`)} />
                    <Input className="md:col-span-2" placeholder="CERTIFICATE URL"
                      {...register(`certificates.${i}.link`)} />
                    <Input className="md:col-span-1" placeholder="Period (e.g., March 2023)"
                      {...register(`certificates.${i}.period`)} />
                    <Textarea className="md:col-span-6" rows={3} placeholder="Bulleted lines (one per line)"
                      {...register(`certificates.${i}.description`)} />
                    <div className="md:col-span-6">
                      <Button variant="outline" type="button" onClick={() => certRemove(i)}>Remove</Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() =>
                  certAppend({ title: "", link: "", period: "", description: "" })
                }>
                  Add Certificate
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">This is a live template preview. Export will match this layout.</span>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <ResumeTemplate data={values} fullName={user?.fullName} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Hidden printable container is no longer required since preview is exact; 
          pdf generator uses #resume-pdf directly from visible preview */}
    </div>
  );
}
