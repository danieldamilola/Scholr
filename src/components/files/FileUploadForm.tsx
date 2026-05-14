"use client";

import { useState } from "react";
import { Upload, Loader2, FileText, X, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClientSingleton } from "@/lib/supabase/client";
import {
  COLLEGES,
  DEPARTMENTS,
  PROGRAMMES,
  LEVELS,
  SEMESTERS,
  ALLOWED_FILE_TYPES,
} from "@/constants";
import { useUser } from "@/hooks/useUser";
import { invalidateFilesCache } from "@/hooks/useFiles";

type FormErrors = {
  title?: string;
  courseCode?: string;
  college?: string;
  department?: string;
  programme?: string;
  level?: string;
  semester?: string;
  file?: string;
  general?: string;
};

const inputCls =
  "bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3 disabled:opacity-50 disabled:cursor-not-allowed";

const labelCls = "block text-ink-soft text-sm font-medium mb-1";

export function FileUploadForm() {
  const { user } = useUser();
  const role = user?.profile?.role;
  const [materialType, setMaterialType] = useState<
    "course_material" | "past_question"
  >("course_material");
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [isGeneral, setIsGeneral] = useState(false);
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const availableDepartments = college
    ? DEPARTMENTS[college as keyof typeof DEPARTMENTS] || []
    : [];
  const availableProgrammes = department
    ? PROGRAMMES[department as keyof typeof PROGRAMMES] || []
    : [];

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setDepartment("");
    setProgrammes([]);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setProgrammes([]);
  };

  const handleGeneralToggle = () => {
    const next = !isGeneral;
    setIsGeneral(next);
    if (next) {
      setCollege("");
      setDepartment("");
      setProgrammes([]);
    }
  };

  const toggleProgramme = (p: string) => {
    setProgrammes((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const validateFile = (selectedFile: File): string | null => {
    const fileType = Object.values(ALLOWED_FILE_TYPES).find(
      (type) =>
        type.mime === selectedFile.type ||
        selectedFile.name.endsWith(type.extension),
    );
    if (!fileType)
      return "Invalid file type. Allowed: PDF, DOCX, PPTX, PNG, JPG, TXT";
    if (selectedFile.size > 50 * 1024 * 1024)
      return "File size must be less than 50MB";
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const err = validateFile(selectedFile);
    if (err) {
      setErrors((prev) => ({ ...prev, file: err }));
      setFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    const err = validateFile(dropped);
    if (err) {
      setErrors((prev) => ({ ...prev, file: err }));
      setFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFile(dropped);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!courseCode.trim()) newErrors.courseCode = "Course code is required";
    if (!isGeneral) {
      if (!college) newErrors.college = "College is required";
      if (!department) newErrors.department = "Department is required";
      if (programmes.length === 0)
        newErrors.programme = "Select at least one programme";
    }
    if (!level) newErrors.level = "Level is required";
    if (!semester) newErrors.semester = "Semester is required";
    if (!file) newErrors.file = "File is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !file || !user?.profile) return;

    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const supabase = createClientSingleton();
      const userId = user.session?.user.id;
      if (!userId) throw new Error("User not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(filePath, file);
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("course-materials")
        .getPublicUrl(filePath);

      // 2. Insert DB record with a pre-generated ID (text_content filled server-side)
      const fileId = crypto.randomUUID();
      const { error: insertError } = await supabase.from("files").insert({
        id: fileId,
        title,
        course_code: courseCode,
        description: description || null,
        college: isGeneral ? "General" : college,
        department: isGeneral ? "General" : department,
        programmes: isGeneral ? ["General"] : programmes,
        level,
        semester,
        file_type: file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
        file_url: urlData.publicUrl,
        storage_path: filePath,
        tags: tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        text_content: null,
        uploaded_by: userId,
        uploader_name: user.profile.full_name,
        uploader_role: user.profile.role,
        material_type: materialType,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (insertError) {
        await supabase.storage.from("course-materials").remove([filePath]);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      // 3. Fire-and-forget server-side text extraction (non-blocking)
      fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          storagePath: filePath,
          fileType: file.type,
          bucket: "course-materials",
        }),
      }).catch(() => {
        // silent — text extraction is background, upload already succeeded
      });

      // Bust the files cache so Browse/Past Questions reflect the new upload instantly
      invalidateFilesCache();

      // Reset form
      setTitle("");
      setCourseCode("");
      setDescription("");
      setCollege("");
      setDepartment("");
      setProgrammes([]);
      setLevel("");
      setSemester("");
      setTags("");
      setFile(null);
      setIsGeneral(false);
      setMaterialType("course_material");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.general && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {errors.general}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-success-bg border border-success px-4 py-3 text-sm text-success-text">
          <CheckCircle2 className="size-4 shrink-0" />
          File uploaded successfully! Text extraction is running in the
          background.
        </div>
      )}

      {/* Material Type — class_rep gets extra option */}
      {role === "class_rep" && (
        <div>
          <p className="text-ink-muted text-xs font-medium uppercase tracking-wide mb-3">
            Material Type
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMaterialType("course_material")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                materialType === "course_material"
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-ink-soft border-border hover:border-border"
              }`}
            >
              Course Material
            </button>
            <button
              type="button"
              onClick={() => setMaterialType("past_question")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                materialType === "past_question"
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-ink-soft border-border hover:border-border"
              }`}
            >
              Past Questions
            </button>
          </div>
        </div>
      )}

      {/* File Details */}
      <p className="text-ink-muted text-xs font-medium uppercase tracking-wide">
        File Details
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelCls}>
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Introduction to Calculus"
            disabled={isLoading}
            className={inputCls}
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="courseCode" className={labelCls}>
            Course Code *
          </label>
          <input
            id="courseCode"
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="MTH101"
            disabled={isLoading}
            className={inputCls}
          />
          {errors.courseCode && (
            <p className="text-red-600 text-sm mt-1">{errors.courseCode}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the file"
          disabled={isLoading}
          rows={3}
          className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent w-full px-3 py-2 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Academic Info */}
      <p className="text-ink-muted text-xs font-medium uppercase tracking-wide pt-1">
        Academic Info
      </p>

      {/* General Course Toggle */}
      <button
        type="button"
        onClick={handleGeneralToggle}
        disabled={isLoading}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-md border transition-colors text-sm ${
          isGeneral
            ? "bg-brand-wash border-brand/30 text-brand"
            : "bg-surface border-border text-ink-muted hover:border-border"
        }`}
      >
        <div className="text-left">
          <p className="font-medium">General Course</p>
          <p className="text-xs mt-0.5 opacity-70">
            {isGeneral
              ? "This file applies to all departments at the selected level (e.g. GST, SDN courses)"
              : "Toggle on if this course applies to all departments (e.g. GST 401, SDN 201)"}
          </p>
        </div>
        <div
          className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            isGeneral ? "bg-brand border-brand" : "border-border"
          }`}
        >
          {isGeneral && <div className="size-2 rounded-full bg-surface" />}
        </div>
      </button>

      {/* College / Department / Programme — hidden when General */}
      {!isGeneral && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>College *</label>
            <Select
              value={college}
              onValueChange={handleCollegeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.filter((c) => c !== "General").map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.college && (
              <p className="text-red-600 text-sm mt-1">{errors.college}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Department *</label>
            <Select
              value={department}
              onValueChange={handleDepartmentChange}
              disabled={!college || isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    college ? "Select department" : "Select a college first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-600 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {/* Programme — multi-select checkboxes */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              Programmes *{" "}
              <span className="font-normal text-ink-muted">
                (select all that apply)
              </span>
            </label>
            {!department ? (
              <p className="text-sm text-ink-muted italic">
                Select a department first
              </p>
            ) : availableProgrammes.length === 0 ? (
              <p className="text-sm text-ink-muted italic">
                No programmes available for this department
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {availableProgrammes.map((p) => {
                  const checked = programmes.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={isLoading}
                      onClick={() => toggleProgramme(p)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors disabled:opacity-50 ${
                        checked
                          ? "bg-brand text-white border-brand"
                          : "bg-surface text-ink-muted border-border hover:border-border"
                      }`}
                    >
                      {checked && <span>✓</span>}
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.programme && (
              <p className="text-red-600 text-sm mt-1">{errors.programme}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Level *</label>
            <Select value={level} onValueChange={setLevel} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-red-600 text-sm mt-1">{errors.level}</p>
            )}
          </div>
        </div>
      )}

      {/* When General: only show Level */}
      {isGeneral && (
        <div className="max-w-[calc(50%-8px)]">
          <label className={labelCls}>Level *</label>
          <Select value={level} onValueChange={setLevel} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-red-600 text-sm mt-1">{errors.level}</p>
          )}
        </div>
      )}

      <div>
        <label className={labelCls}>Semester *</label>
        <Select
          value={semester}
          onValueChange={setSemester}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            {SEMESTERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.semester && (
          <p className="text-red-600 text-sm mt-1">{errors.semester}</p>
        )}
      </div>

      <div>
        <label htmlFor="tags" className={labelCls}>
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="calculus, mathematics, notes (comma-separated)"
          disabled={isLoading}
          className={inputCls}
        />
      </div>

      {/* File Upload */}
      <p className="text-ink-muted text-xs font-medium uppercase tracking-wide pt-1">
        File *
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md p-8 text-center transition-colors ${
          isDragging
            ? "border-brand bg-brand-wash"
            : file
              ? "border-border bg-subtle"
              : "border-border hover:border-border"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="size-5 text-ink-muted shrink-0" />
            <span className="text-sm text-ink-soft truncate max-w-xs">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1 text-ink-muted hover:text-ink-soft transition-colors"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload
              className="size-8 text-ink-muted mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-ink-muted mb-1">
              Drag and drop a file here, or{" "}
              <label
                htmlFor="fileInput"
                className="text-brand-muted hover:text-brand cursor-pointer font-medium"
              >
                browse
              </label>
            </p>
            <p className="text-xs text-ink-muted">
              PDF, DOCX, PPTX, PNG, JPG, TXT — max 50MB
            </p>
          </>
        )}
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.txt"
          disabled={isLoading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
      {errors.file && (
        <p className="text-red-600 text-sm -mt-3">{errors.file}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <Upload className="size-4" /> Upload File
          </>
        )}
      </button>
    </form>
  );
}
