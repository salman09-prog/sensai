"use client";

import { improveWithAI } from "@/actions/resume";
import { entrySchema } from "@/app/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Loader2, PlusCircle, Sparkles, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

const EntryForm = ({ type, entries, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  const current = watch("current");

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "" : formatDisplayDate(data.endDate),
    };

    onChange([...entries, formattedEntry]);

    reset();
    setIsAdding(false);
  });

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully");
    }
  }, [improvedContent, improveError, isImproving]);

  const handleImproveDescription = async () => {
    const description = watch("description");

    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(),
    });
  };

  // 🔥 Dynamic placeholders based on section type
  const placeholders = {
    experience: {
      title: "Title / Position",
      organization: "Organization / Company",
    },
    project: {
      title: "Project Name",
      organization: "Tech Stack / Role",
    },
    education: {
      title: "Degree / Course",
      organization: "Institution / University",
    },
  };

  const { title: titlePlaceholder, organization: orgPlaceholder } =
    placeholders[type.toLowerCase()] || placeholders.education;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) => {
          const sectionType = type.toLowerCase();

          return (
            <Card
              key={index}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-4 mb-4"
            >
              {/* ===== Experience Section ===== */}
              {sectionType === "experience" && (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {item.organization}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.current
                        ? `${item.startDate} - Present`
                        : `${item.startDate} - ${item.endDate}`}
                    </span>
                  </div>

                  <ul className="list-disc ml-5 mt-2 text-sm text-gray-700 leading-relaxed">
                    {item.description
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                </>
              )}

              {/* ===== Project Section ===== */}
              {sectionType === "project" && (
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-blue-700">
                      {item.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {item.startDate} - {item.endDate}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 font-medium mt-1">
                    {item.organization}
                  </p>

                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                    {item.description}
                  </p>

                  {item.technologies && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.technologies.split(",").map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-full"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ===== Education Section ===== */}
              {sectionType === "education" && (
                <div>
                  <h3 className="text-lg font-semibold text-green-700">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {item.organization}
                  </p>
                  <span className="text-xs text-gray-500">
                    {item.startDate} - {item.endDate}
                  </span>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* ===== Skills Section ===== */}
              {sectionType === "skills" && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-700">
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.description.split(",").map((skill, i) => (
                      <span
                        key={i}
                        className="text-sm bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-full"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== Default Section (Fallback) ===== */}
              {!["experience", "project", "education", "skills"].includes(
                sectionType
              ) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title} @ {item.organization}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {item.startDate} - {item.endDate}
                  </p>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Delete Button */}
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => handleDelete(index)}
                >
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder={titlePlaceholder}
                  {...register("title")}
                  error={errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder={orgPlaceholder}
                  {...register("organization")}
                  error={errors.organization}
                />
                {errors.organization && (
                  <p className="text-sm text-red-500">
                    {errors.organization.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  type="month"
                  {...register("startDate")}
                  error={errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="month"
                  {...register("endDate")}
                  disabled={current}
                  error={errors.endDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
              />
              <label htmlFor="current">Current {type}</label>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder={`Description of your ${type.toLowerCase()}`}
                className="h-32"
                {...register("description")}
                error={errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImproveDescription}
              disabled={isImproving || !watch("description")}
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve with AI
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsAdding(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
};

export default EntryForm;
