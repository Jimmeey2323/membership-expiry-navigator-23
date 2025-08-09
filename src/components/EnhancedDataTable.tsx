
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { MembershipData } from "@/types/membership";
import { 
  Search, Filter, Download, Users, Calendar, MapPin, 
  Target, Hash, Mail, ChevronLeft, ChevronRight,
  ArrowUpDown, MoreHorizontal, Eye, Edit
} from "lucide-react";

interface EnhancedDataTableProps {
  data: MembershipData[];
  onRowClick: (member: MembershipData) => void;
  searchTerm: string;
}

export const EnhancedDataTable = ({ data, onRowClick, searchTerm }: EnhancedDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MembershipData;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSort = (key: keyof MembershipData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredData = useMemo(() => {
    let filteredData = data.filter(member => 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membershipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(member => member.uniqueId)));
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getSessionsBadge = (sessions: number) => {
    if (sessions === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (sessions <= 5) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (sessions <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <Card className="premium-card shadow-xl border-2 border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Complete Member Overview
              </CardTitle>
              <p className="text-slate-600 font-medium mt-1">
                {sortedAndFilteredData.length} members • {selectedRows.size} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="font-semibold">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="lg" className="font-semibold">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="table-premium rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-slate-200">
                <TableHead className="w-12 p-4">
                  <Checkbox
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-slate-400"
                  />
                </TableHead>
                <TableHead 
                  className="font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors p-4"
                  onClick={() => handleSort('memberId')}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors p-4"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Name
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors p-4"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-800 p-4">Membership</TableHead>
                <TableHead 
                  className="font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors p-4"
                  onClick={() => handleSort('endDate')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-800 p-4">Status</TableHead>
                <TableHead 
                  className="font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors p-4"
                  onClick={() => handleSort('sessionsLeft')}
                >
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Sessions
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors p-4"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-800 p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((member) => (
                <TableRow 
                  key={member.uniqueId}
                  className="table-row-premium border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group"
                  onClick={() => onRowClick(member)}
                >
                  <TableCell className="p-4">
                    <Checkbox
                      checked={selectedRows.has(member.uniqueId)}
                      onCheckedChange={() => handleRowSelect(member.uniqueId)}
                      onClick={(e) => e.stopPropagation()}
                      className="border-slate-400"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600 p-4">
                    {member.memberId}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 p-4 min-w-48">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      {member.firstName} {member.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 p-4 min-w-64">
                    {member.email}
                  </TableCell>
                  <TableCell className="text-slate-600 p-4 min-w-48">
                    <div className="truncate max-w-xs" title={member.membershipName}>
                      {member.membershipName}
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="text-slate-900 font-medium">
                      {new Date(member.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {Math.ceil((new Date(member.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge className={`font-semibold border-2 px-3 py-1 ${getStatusBadge(member.status)}`}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge className={`font-bold text-center min-w-12 border-2 px-3 py-1 ${getSessionsBadge(member.sessionsLeft)}`}>
                      {member.sessionsLeft}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {member.location}
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(member);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedAndFilteredData.length)} of {sortedAndFilteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="font-semibold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="font-semibold"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="font-semibold"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
