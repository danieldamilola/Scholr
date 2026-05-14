"use client";

import { useState } from "react";
import { Upload, Loader2, FileText, X, ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClientSingleton } from "@/lib/supabase/client";
import { extractTextFromFile } from "@/lib/extractText";
import { COLLEGES, DEPARTMENTS, ALLOWED_FILE_TYPES } from "@/constants";
import { useUser } from "@/hooks/useUser";

type FormErrors = {
  title?: string;
  author?: string;
  college?: string;
  department?: string;
  file?: string;
  cover?: string;
  general?: string;
};

const inputCls =
  "bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3 disabled:opacity-50 disabled:cursor-not-allowed";

const labelCls = "block text-ink-soft text-sm font-medium mb-1";

export function BookUploadForm() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const availableDepartments = college
    ? DEPARTMENTS[college as keyof typeof DEPARTMENTS] || []
    : [];

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setDepartment("");
  };

  const validateBookFile = (selectedFile: File): string | null => {
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

  const validateCoverFile = (selectedFile: File): string | null => {
    if (!selectedFile.type.startsWith("image/"))
      return "Cover must be an image (PNG, JPG)";
    if (selectedFile.size > 5 * 1024 * 1024)
      return "Cover size must be less than 5MB";
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const err = validateBookFile(selectedFile);
    if (err) {
      setErrors((prev) => ({ ...prev, file: err }));
      setFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFile(selectedFile);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const err = validateCoverFile(selectedFile);
    if (err) {
      setErrors((prev) => ({ ...prev, cover: err }));
      setCover(null);
      return;
    }
    setErrors((prev) => ({ ...prev, cover: undefined }));
    setCover(selectedFile);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    const err = validateBookFile(dropped);
    if (err) {
      setErrors((prev) => ({ ...prev, file: err }));
      setFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFile(dropped);
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    const err = validateCoverFile(dropped);
    if (err) {
      setErrors((prev) => ({ ...prev, cover: err }));
      setCover(null);
      return;
    }
    setErrors((prev) => ({ ...prev, cover: undefined }));
    setCover(dropped);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!author.trim()) newErrors.author = "Author is required";
    if (!college) newErrors.college = "College is required";
    if (!department) newErrors.department = "Department is required";
    if (!file) newErrors.file = "Book file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !file || !user?.profile) return;

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClientSingleton();
      const userId = user.session?.user.id;
      if (!userId) throw new Error("User not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/books/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("library-books")
        .upload(filePath, file);
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("library-books")
        .getPublicUrl(filePath);

      let coverUrl: string | null = null;
      if (cover) {
        const coverExt = cover.name.split(".").pop();
        const coverName = `${Date.now()}_cover.${coverExt}`;
        const coverPath = `${userId}/covers/${coverName}`;

        const { error: coverUploadError } = await supabase.storage
          .from("library-covers")
          .upload(coverPath, cover);
        if (coverUploadError)
          throw new Error(`Cover upload failed: ${coverUploadError.message}`);

        const { data: coverUrlData } = supabase.storage
          .from("library-covers")
          .getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      let textContent: string | null = null;
      try {
        textContent = await extractTextFromFile(file);
      } catch {}

      const { error: insertError } = await supabase.from("books").insert({
        title,
        author,
        description: description || null,
        college,
        department,
        subject: subject || null,
        file_url: urlData.publicUrl,
        storage_path: filePath,
        cover_url: coverUrl,
        text_content: textContent,
        uploaded_by: userId,
        uploader_name: user.profile.full_name,
      } as any);

      if (insertError) {
        await supabase.storage.from("library-books").remove([filePath]);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      // Reset
      setTitle("");
      setAuthor("");
      setDescription("");
      setCollege("");
      setDepartment("");
      setSubject("");
      setFile(null);
      setCover(null);

      alert("Book uploaded successfully!");
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
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.general}
        </div>
      )}

      {/* Book Details */}
      <p className="text-ink-muted text-xs font-medium uppercase tracking-wide">
        Book Details
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
            <p className="text-destructive text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="author" className={labelCls}>
            Author *
          </label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="James Stewart"
            disabled={isLoading}
            className={inputCls}
          />
          {errors.author && (
            <p className="text-destructive text-sm mt-1">{errors.author}</p>
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
          placeholder="Brief description of the book"
          disabled={isLoading}
          rows={3}
          className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent w-full px-3 py-2 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="subject" className={labelCls}>
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Mathematics"
          disabled={isLoading}
          className={inputCls}
        />
      </div>

      {/* Academic Info */}
      <p className="text-ink-muted text-xs font-medium uppercase tracking-wide pt-1">
        Academic Info
      </p>

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
              {COLLEGES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.college && (
            <p className="text-destructive text-sm mt-1">{errors.college}</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Department *</label>
          <Select
            value={department}
            onValueChange={setDepartment}
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
            <p className="text-destructive text-sm mt-1">{errors.department}</p>
          )}
        </div>
      </div>

      {/* File Uploads */}
      <p className="text-ink-muted text-xs font-medium uppercase tracking-wide pt-1">
        Files
      </p>

      {/* Book File drop zone */}
      <div>
        <label className={labelCls}>Book File *</label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleFileDrop}
          className={`relative border-2 border-dashed rounded-md p-8 text-center transition-colors ${
            isDraggingFile
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
                  htmlFor="bookFileInput"
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
            id="bookFileInput"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx,.pptx,.png,.jpg,.txt"
            disabled={isLoading}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
        {errors.file && (
          <p className="text-destructive text-sm mt-1">{errors.file}</p>
        )}
      </div>

      {/* Cover Image drop zone */}
      <div>
        <label className={labelCls}>
          Cover Image{" "}
          <span className="text-ink-muted font-normal">(Optional)</span>
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingCover(true);
          }}
          onDragLeave={() => setIsDraggingCover(false)}
          onDrop={handleCoverDrop}
          className={`relative border-2 border-dashed rounded-md p-6 text-center transition-colors ${
            isDraggingCover
              ? "border-brand bg-brand-wash"
              : cover
                ? "border-border bg-subtle"
                : "border-border hover:border-border"
          }`}
        >
          {cover ? (
            <div className="flex items-center justify-center gap-3">
              <ImageIcon className="size-5 text-ink-muted shrink-0" />
              <span className="text-sm text-ink-soft truncate max-w-xs">
                {cover.name}
              </span>
              <button
                type="button"
                onClick={() => setCover(null)}
                className="p-1 text-ink-muted hover:text-ink-soft transition-colors"
                aria-label="Remove cover"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <ImageIcon
                className="size-7 text-ink-muted mx-auto mb-2"
                strokeWidth={1.5}
              />
              <p className="text-sm text-ink-muted mb-1">
                Drag a cover image here, or{" "}
                <label
                  htmlFor="coverInput"
                  className="text-brand-muted hover:text-brand cursor-pointer font-medium"
                >
                  browse
                </label>
              </p>
              <p className="text-xs text-ink-muted">PNG, JPG, JPEG — max 5MB</p>
            </>
          )}
          <input
            id="coverInput"
            type="file"
            onChange={handleCoverChange}
            accept=".png,.jpg,.jpeg"
            disabled={isLoading}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
        {errors.cover && (
          <p className="text-destructive text-sm mt-1">{errors.cover}</p>
        )}
      </div>

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
            <Upload className="size-4" /> Upload Book
          </>
        )}
      </button>
    </form>
  );
}
