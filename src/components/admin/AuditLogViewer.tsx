import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Shield,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  FileJson,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { auditService } from '../../lib/auditService';
import { AuditLog, AuditLogFilter, AuditActionType, AuditSeverity } from '../../lib/auditTypes';
import { toast } from 'sonner@2.0.3';

interface AuditLogViewerProps {
  userRole: 'Admin' | 'Principal';
}

const ITEMS_PER_PAGE = 20;

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ userRole }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<AuditLogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filter, searchTerm]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const allLogs = await auditService.getAllLogs();
      setLogs(allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    const filtered = await auditService.getAllLogs({
      ...filter,
      searchTerm,
    });
    setFilteredLogs(filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setCurrentPage(1);
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = await auditService.exportAsJSON(filter);
        filename = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        content = await auditService.exportAsCSV(filter);
        filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredLogs.length} logs as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getSeverityBadgeVariant = (severity: AuditSeverity) => {
    switch (severity) {
      case 'info':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'critical':
        return 'destructive';
    }
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white">Audit Logs</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive system activity log ({filteredLogs.length} entries)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search logs by action, user, or metadata..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none shadow-none focus-visible:ring-0"
          />
        </div>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filter.startDate ? filter.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      startDate: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filter.endDate ? filter.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      endDate: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Severity</Label>
                <Select
                  value={filter.severities?.[0] || 'all'}
                  onValueChange={(value) =>
                    setFilter({
                      ...filter,
                      severities: value === 'all' ? undefined : [value as AuditSeverity],
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilter({});
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead className="w-[200px]">Action</TableHead>
                <TableHead className="w-[150px]">User</TableHead>
                <TableHead className="w-[120px]">Role</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    Loading audit logs...
                  </TableCell>
                </TableRow>
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(log.severity)}
                        <Badge variant={getSeverityBadgeVariant(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.actionType.replace(/_/g, ' ').toUpperCase()}
                    </TableCell>
                    <TableCell className="text-sm">{log.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.userRole}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {log.metadata.requestId && (
                        <span className="mr-2">Request: {log.metadata.requestId}</span>
                      )}
                      {log.metadata.comment && (
                        <span className="mr-2">Comment: {log.metadata.comment}</span>
                      )}
                      {log.metadata.documentName && (
                        <span className="mr-2">Document: {log.metadata.documentName}</span>
                      )}
                      {log.metadata.failureReason && (
                        <span className="text-red-600">Reason: {log.metadata.failureReason}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length}{' '}
              entries
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
