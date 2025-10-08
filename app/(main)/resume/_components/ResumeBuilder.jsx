"use client";

import { Button } from "@/components/ui/button";
import { Download, Edit, Loader2, Monitor, Save, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/app/lib/schema";
import { saveResume, getResume } from "@/actions/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EntryForm from "./EntryForm";
import useFetch from "@/hooks/use-fetch";
import MDEditor from "@uiw/react-md-editor";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { generateResumeHTML } from "@/app/lib/helper";

const ResumeBuilder = ({ initialContent = "" }) => {
  const [activeTab, setActiveTab] = useState("edit");
  const [resumeMode, setResumeMode] = useState("preview");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useUser();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
      certificates: [],
    },
  });

  const { loading: isSaving, fn: saveResumeFn, data: saveResult, error: saveError } =
    useFetch(saveResume);
  const { loading: isFetching, fn: fetchResumeFn, data: fetchedResume } = useFetch(getResume);

  const formValues = watch();

  // Fetch saved resume when user opens page
  useEffect(() => {
    async function fetchData() {
      const res = await fetchResumeFn();
      if (res?.content) {
        setPreviewContent(res.content);
        setActiveTab("preview");
      }
    }
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = generateResumeHTML(formValues, user?.fullName);
      setPreviewContent(newContent || initialContent);
    }
  }, [formValues, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to DB
  const onSubmit = async () => {
    try {
      await saveResumeFn(previewContent);
      toast.success("Resume saved successfully!");
    } catch (error) {
      toast.error("Failed to save resume");
    }
  };

  // PDF generator
  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      if (!element) throw new Error("Printable element not found");

      const mod = await import("html2pdf.js");
      const html2pdf = mod.default || mod;

      const opt = {
        margin: [5, 5, 5, 5],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">Resume Builder</h1>

        <div className="space-x-2">
          <Button variant={"destructive"} onClick={onSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save
              </>
            )}
          </Button>

          <Button onClick={generatePdf} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating PDF
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* FORM TAB */}
        <TabsContent value="edit">
          <form className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-black/40">
                <Input {...register("contactInfo.email")} placeholder="Email" type="email" />
                <Input {...register("contactInfo.mobile")} placeholder="Mobile" type="tel" />
                <Input {...register("contactInfo.linkedin")} placeholder="LinkedIn URL" type="url" />
                <Input {...register("contactInfo.twitter")} placeholder="Twitter/X Profile" type="url" />

                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} className="h-24" placeholder="Professional Summary" />
                  )}
                />

                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} className="h-24" placeholder="Languages, Frameworks, Tools..." />
                  )}
                />

                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />
                  )}
                />

                <Controller
                  name="education"
                  control={control}
                  render={({ field }) => (
                    <EntryForm type="Education" entries={field.value} onChange={field.onChange} />
                  )}
                />

                <Controller
                  name="projects"
                  control={control}
                  render={({ field }) => (
                    <EntryForm type="Project" entries={field.value} onChange={field.onChange} />
                  )}
                />

                <Controller
                  name="certificates"
                  control={control}
                  render={({ field }) => (
                    <EntryForm type="Certificate" entries={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </div>
          </form>
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview">
          <Button
            variant={"link"}
            className="mb-2"
            onClick={() =>
              setResumeMode(resumeMode === "preview" ? "edit" : "preview")
            }
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className="h-4 w-4" /> Edit Resume
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4" /> Show Preview
              </>
            )}
          </Button>

          {resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if the form data is updated
              </span>
            </div>
          )}

          <div className="border rounded-lg bg-white text-black p-6" id="resume-pdf">
            <div
              className="text-[13px] leading-[1.4] font-sans"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
