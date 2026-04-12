import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COLLEGES, DEPARTMENTS, PROGRAMMES, LEVELS, SEMESTERS } from '@/constants'

interface FilterPanelProps {
  college: string
  department: string
  programme: string
  level: string
  semester: string
  onCollegeChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onProgrammeChange: (value: string) => void
  onLevelChange: (value: string) => void
  onSemesterChange: (value: string) => void
}

export function FilterPanel({
  college,
  department,
  programme,
  level,
  semester,
  onCollegeChange,
  onDepartmentChange,
  onProgrammeChange,
  onLevelChange,
  onSemesterChange,
}: FilterPanelProps) {
  const availableDepartments = college ? DEPARTMENTS[college as keyof typeof DEPARTMENTS] || [] : []
  const availableProgrammes = department ? PROGRAMMES[department as keyof typeof PROGRAMMES] || [] : []

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={college} onValueChange={onCollegeChange}>
        <SelectTrigger className="w-[180px] bg-white border-zinc-200">
          <SelectValue placeholder="College" />
        </SelectTrigger>
        <SelectContent>
          {COLLEGES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={department} onValueChange={onDepartmentChange} disabled={!college}>
        <SelectTrigger className="w-[180px] bg-white border-zinc-200 disabled:opacity-50">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {availableDepartments.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={programme} onValueChange={onProgrammeChange} disabled={!department}>
        <SelectTrigger className="w-[180px] bg-white border-zinc-200 disabled:opacity-50">
          <SelectValue placeholder="Programme" />
        </SelectTrigger>
        <SelectContent>
          {availableProgrammes.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={level} onValueChange={onLevelChange}>
        <SelectTrigger className="w-[120px] bg-white border-zinc-200">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          {LEVELS.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={semester} onValueChange={onSemesterChange}>
        <SelectTrigger className="w-[120px] bg-white border-zinc-200">
          <SelectValue placeholder="Semester" />
        </SelectTrigger>
        <SelectContent>
          {SEMESTERS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
