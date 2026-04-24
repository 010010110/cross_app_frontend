import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search } from "lucide-react";
import { Student } from "@/types/user";
import { useBoxCoaches } from "@/hooks/use-box-coaches";
import { useBoxStudents } from "@/hooks/use-box-students";

export interface ReportFilterValues {
  startDate?: string;
  endDate?: string;
  coachId?: string;
  studentId?: string;
  classId?: string;
  thresholdDays?: number;
  rankingBy?: "prs" | "attendance" | "xp";
  limit?: number;
}

interface ReportFiltersProps {
  selectedBoxId: string | null;
  filters: ReportFilterValues;
  onFiltersChange: (filters: ReportFilterValues) => void;
  reportSpecificFilters?: React.ReactNode; // Slot for report-specific controls
}

export function ReportFilters({
  selectedBoxId,
  filters,
  onFiltersChange,
  reportSpecificFilters,
}: ReportFiltersProps) {
  const { data: coaches = [] } = useBoxCoaches(selectedBoxId);
  const { data: students = [] } = useBoxStudents(selectedBoxId);

  // Local state for date inputs (text-based for better UX)
  const [startDateInput, setStartDateInput] = useState(
    filters.startDate ? format(new Date(filters.startDate), "yyyy-MM-dd") : ""
  );
  const [endDateInput, setEndDateInput] = useState(
    filters.endDate ? format(new Date(filters.endDate), "yyyy-MM-dd") : ""
  );

  // Local state for search inputs
  const [searchCoach, setSearchCoach] = useState("");
  const [searchStudent, setSearchStudent] = useState("");

  // Filter coaches and students based on search
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) =>
      coach.name.toLowerCase().includes(searchCoach.toLowerCase())
    );
  }, [coaches, searchCoach]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchStudent.toLowerCase())
    );
  }, [students, searchStudent]);

  // Active filters count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.coachId) count++;
    if (filters.studentId) count++;
    if (filters.classId) count++;
    return count;
  }, [filters]);

  const handleApplyFilters = () => {
    const updated = { ...filters };
    if (startDateInput) {
      updated.startDate = new Date(startDateInput).toISOString();
    } else {
      delete updated.startDate;
    }
    if (endDateInput) {
      updated.endDate = new Date(endDateInput).toISOString();
    } else {
      delete updated.endDate;
    }
    onFiltersChange(updated);
  };

  const handleClearFilters = () => {
    onFiltersChange({});
    setStartDateInput("");
    setEndDateInput("");
    setSearchCoach("");
    setSearchStudent("");
  };

  const handleCoachChange = (coachId: string) => {
    if (coachId === "clear") {
      const { coachId: _, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, coachId });
    }
    setSearchCoach("");
  };

  const handleStudentChange = (studentId: string) => {
    if (studentId === "clear") {
      const { studentId: _, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, studentId });
    }
    setSearchStudent("");
  };

  const selectedCoach = coaches.find((c) => c._id === filters.coachId);
  const selectedStudent = students.find((s) => s._id === filters.studentId);

  return (
    <Card className="p-4 mb-4 border-border/60 glass-card">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <h3 className="font-semibold">Filtros</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} ativo</Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar tudo
            </button>
          )}
        </div>

        {/* Global Filters - Line 1: Dates and Apply */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* Date Range */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Data Inicial
            </label>
            <Input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Data Final
            </label>
            <Input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Apply Button */}
          <div className="flex items-end">
            <Button
              onClick={handleApplyFilters}
              variant="default"
              size="sm"
              className="w-full h-8 text-sm"
            >
              Aplicar
            </Button>
          </div>
        </div>

        {/* Global Filters - Line 2: Coach and Student with Search */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Coach Selector with Search */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Coach
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar coach..."
                  value={searchCoach}
                  onChange={(e) => setSearchCoach(e.target.value)}
                  className="h-8 text-sm pl-8"
                />
              </div>
              <Select value={filters.coachId || ""} onValueChange={handleCoachChange}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Todos</SelectItem>
                  {filteredCoaches.map((coach) => (
                    <SelectItem key={coach._id} value={coach._id}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Selector with Search */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Aluno
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="h-8 text-sm pl-8"
                />
              </div>
              <Select value={filters.studentId || ""} onValueChange={handleStudentChange}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Todos</SelectItem>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Report-Specific Filters Slot */}
        {reportSpecificFilters && (
          <div className="pt-2 border-t border-border/40">
            {reportSpecificFilters}
          </div>
        )}

        {/* Filter Tags */}
        {(filters.startDate || filters.endDate || filters.coachId || filters.studentId) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.startDate && (
              <Badge
                variant="outline"
                className="flex items-center gap-1"
              >
                De: {format(new Date(filters.startDate), "dd/MM/yyyy", { locale: ptBR })}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-70"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      startDate: undefined,
                    })
                  }
                />
              </Badge>
            )}
            {filters.endDate && (
              <Badge
                variant="outline"
                className="flex items-center gap-1"
              >
                Até: {format(new Date(filters.endDate), "dd/MM/yyyy", { locale: ptBR })}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-70"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      endDate: undefined,
                    })
                  }
                />
              </Badge>
            )}
            {selectedCoach && (
              <Badge
                variant="outline"
                className="flex items-center gap-1"
              >
                Coach: {selectedCoach.name}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-70"
                  onClick={() => handleCoachChange("clear")}
                />
              </Badge>
            )}
            {selectedStudent && (
              <Badge
                variant="outline"
                className="flex items-center gap-1"
              >
                Aluno: {selectedStudent.name}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-70"
                  onClick={() => handleStudentChange("clear")}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
