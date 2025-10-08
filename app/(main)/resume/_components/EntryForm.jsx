// app/(main)/components/EntryForm.jsx
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
      link: "",
    },
  });

  const { loading: isImproving, fn: improveWithAIFn, data: improvedContent } =
    useFetch(improveWithAI);

  const current = watch("current");

  const handleDelete = (index) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const handleAdd = handleValidation((data) => {
    const start = data.startDate ? formatDisplayDate(data.startDate) : "";
    const end = data.current ? "Present" : data.endDate ? formatDisplayDate(data.endDate) : "";
    const formattedEntry = {
      ...data,
      startDate: start,
      endDate: data.current ? "" : end,
      period: start && (data.current ? `${start} - Present` : end ? `${start} - ${end}` : start),
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
  }, [improvedContent, isImproving, setValue]);

  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) return toast.error("Please enter a description first");

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(),
    });
  };

  const placeholders = {
    experience: { title: "Title / Position", organization: "Organization / Company" },
    project: { title: "Project Name", organization: "Tech Stack / Role" },
    education: { title: "Degree / Course", organization: "Institution / University" },
  };

  const { title: titlePlaceholder, organization: orgPlaceholder } =
    placeholders[type.toLowerCase()] || placeholders.education;

  const sectionType = type.toLowerCase();

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={index} className="border shadow-sm rounded-2xl p-4 mb-4">
            {sectionType === "experience" && (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.organization}</h3>
                    <p className="text-sm text-gray-600 font-medium">{item.title}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.period}</span>
                </div>
                <ul className="list-disc ml-5 mt-2 text-sm text-gray-700 leading-relaxed">
                  {item.description
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                </ul>
                {item.link && (
                  <div className="mt-2 text-xs">
                    <a className="text-blue-600 underline" href={item.link} target="_blank" rel="noreferrer">
                      LINK
                    </a>
                  </div>
                )}
              </>
            )}

            {sectionType === "education" && (
              <>
                <h3 className="text-lg font-semibold text-green-700">{item.title}</h3>
                <p className="text-sm text-gray-600 font-medium">{item.organization}</p>
                <span className="text-xs text-gray-500">{item.period}</span>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.description}</p>
              </>
            )}

            {sectionType === "project" && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-700">{item.title}</h3>
                  <span className="text-xs text-gray-500">{item.period}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium mt-1">{item.organization}</p>
                <ul className="list-disc ml-5 mt-2 text-sm text-gray-700 leading-relaxed">
                  {item.description
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                </ul>
                {item.link && (
                  <div className="mt-2 text-xs">
                    <a className="text-blue-600 underline" href={item.link} target="_blank" rel="noreferrer">
                      LINK
                    </a>
                  </div>
                )}
              </>
            )}

            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="icon" type="button" onClick={() => handleDelete(index)}>
                <X className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input placeholder={titlePlaceholder} {...register("title")} />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Input placeholder={orgPlaceholder} {...register("organization")} />
                {errors.organization && <p className="text-sm text-red-500">{errors.organization.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input type="month" {...register("startDate")} />
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Input type="month" {...register("endDate")} disabled={current} />
                {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) setValue("endDate", "");
                }}
              />
              <label htmlFor="current">Current {type}</label>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder={`Bulleted description of your ${type.toLowerCase()} (one bullet per line)`}
                className="h-32"
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Input placeholder="Optional LINK URL" {...register("link")} />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                const description = watch("description");
                if (!description) return toast.error("Please enter a description first");
                await improveWithAIFn({ current: description, type: type.toLowerCase() });
              }}
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
        <Button className="w-full" variant="outline" onClick={() => setIsAdding(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
};

export default EntryForm;
