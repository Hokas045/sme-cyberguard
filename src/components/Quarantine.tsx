"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Shield,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Download,
  MoreHorizontal,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";
import { useToast } from "@/hooks/use-toast";

interface QuarantinedFileData {
  id: string;
  file_name: string;
  file_path: string;
  hash: string;
  device_id: string;
  hostname: string;
  quarantined_at: string;
  status: string;
  threat_type: string;
  file_size: number;
  quarantine_path: string;
  original_path: string;
  action_taken: string;
}

interface DeviceOption {
  id: string;
  hostname: string;
}

const Quarantine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const businessId = user?.business_id;

  // Filter states
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [threatTypeFilter, setThreatTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<QuarantinedFileData | null>(null);

  // Fetch devices for dropdown
  const { data: devices } = useQuery({
    queryKey: ['devices-options', businessId],
    queryFn: async (): Promise<DeviceOption[]> => {
      if (!businessId) throw new Error('No business ID');
      const result = await query(
        'SELECT id, hostname FROM devices WHERE business_id = ? ORDER BY hostname',
        [businessId]
      );
      return result as DeviceOption[];
    },
    enabled: !!businessId
  });

  // Fetch quarantined files with filters and 60s polling
  const { data: quarantinedFiles, isLoading: filesLoading, refetch: refetchFiles } = useQuery({
    queryKey: ['quarantined-files', businessId, deviceFilter, threatTypeFilter],
    queryFn: async (): Promise<QuarantinedFileData[]> => {
      if (!businessId) throw new Error('No business ID');

      let sql = `
        SELECT
          q.id,
          q.file_name,
          q.file_path,
          q.hash,
          q.device_id,
          q.quarantined_at,
          q.status,
          q.threat_type,
          q.file_size,
          q.quarantine_path,
          q.original_path,
          q.action_taken,
          d.hostname
        FROM quarantined_threats q
        JOIN devices d ON q.device_id = d.id
        WHERE q.business_id = ? AND q.status = 'quarantined'
      `;

      const params: any[] = [businessId];

      // Device filter
      if (deviceFilter !== "all") {
        sql += " AND q.device_id = ?";
        params.push(deviceFilter);
      }

      // Threat type filter
      if (threatTypeFilter !== "all") {
        sql += " AND q.threat_type = ?";
        params.push(threatTypeFilter);
      }

      sql += " ORDER BY q.quarantined_at DESC";

      const result = await query(sql, params);
      return result as QuarantinedFileData[];
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Mutation for deleting quarantined file
  const deleteFileMutation = useMutation({
    mutationFn: async (file: QuarantinedFileData) => {
      // Update quarantined_threats status
      await query(
        'UPDATE quarantined_threats SET status = ?, action_taken = ? WHERE id = ?',
        ['deleted', 'deleted', file.id]
      );

      // Insert remote command
      await query(
        'INSERT INTO remote_commands (id, business_id, device_id, command, target, status) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), businessId, file.device_id, 'delete_file', file.quarantine_path, 'pending']
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantined-files'] });
      toast({
        title: "Success",
        description: "File permanently deleted from quarantine",
      });
      setDeleteConfirmOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  });

  // Mutation for restoring quarantined file
  const restoreFileMutation = useMutation({
    mutationFn: async (file: QuarantinedFileData) => {
      // Update quarantined_threats status
      await query(
        'UPDATE quarantined_threats SET status = ?, action_taken = ? WHERE id = ?',
        ['restored', 'restored', file.id]
      );

      // Insert remote command
      const target = `${file.quarantine_path}|${file.original_path}`;
      await query(
        'INSERT INTO remote_commands (id, business_id, device_id, command, target, status) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), businessId, file.device_id, 'restore_file', target, 'pending']
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantined-files'] });
      toast({
        title: "Success",
        description: "File restoration initiated",
      });
      setRestoreConfirmOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to restore file",
        variant: "destructive",
      });
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (file: QuarantinedFileData) => {
    setSelectedFile(file);
    setDeleteConfirmOpen(true);
  };

  const handleRestore = (file: QuarantinedFileData) => {
    setSelectedFile(file);
    setRestoreConfirmOpen(true);
  };

  const handleDownload = (file: QuarantinedFileData) => {
    setSelectedFile(file);
    setDownloadConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFile) {
      deleteFileMutation.mutate(selectedFile);
    }
  };

  const confirmRestore = () => {
    if (selectedFile) {
      restoreFileMutation.mutate(selectedFile);
    }
  };

  // Mutation for downloading quarantined file
  const downloadFileMutation = useMutation({
    mutationFn: async (file: QuarantinedFileData) => {
      // Update quarantined_threats status
      await query(
        'UPDATE quarantined_threats SET status = ?, action_taken = ? WHERE id = ?',
        ['downloaded', 'downloaded', file.id]
      );

      // Insert remote command
      await query(
        'INSERT INTO remote_commands (id, business_id, device_id, command, target, status) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), businessId, file.device_id, 'download_file', file.quarantine_path, 'pending']
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantined-files'] });
      toast({
        title: "Success",
        description: "File download initiated",
      });
      setDownloadConfirmOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to initiate download",
        variant: "destructive",
      });
    }
  });

  const confirmDownload = () => {
    if (selectedFile) {
      downloadFileMutation.mutate(selectedFile);
    }
  };

  const filteredFiles = quarantinedFiles?.filter(file =>
    file.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.hostname.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (filesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Quarantine Management</h1>
          <p className="text-muted-foreground mt-1">Manage quarantined files and restore or permanently delete them</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchFiles()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Device</label>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {devices?.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.hostname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Threat Type</label>
              <Select value={threatTypeFilter} onValueChange={setThreatTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="malware">Malware</SelectItem>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="ransomware">Ransomware</SelectItem>
                  <SelectItem value="usb">USB</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarantined Files Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Quarantined Files ({filteredFiles.length})</CardTitle>
          </div>
          <CardDescription>Files isolated due to security threats - automatic updates every 60 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Path</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Quarantine Path</TableHead>
                    <TableHead>Quarantined At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action Taken</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium max-w-xs truncate" title={file.file_path}>
                        {file.file_path}
                      </TableCell>
                      <TableCell>{file.hostname}</TableCell>
                      <TableCell className="max-w-xs truncate" title={file.quarantine_path}>
                        {file.quarantine_path}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(file.quarantined_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{file.status}</Badge>
                      </TableCell>
                      <TableCell>{file.action_taken || 'None'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRestore(file)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(file)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(file)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quarantined files</h3>
              <p className="text-muted-foreground">No files match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently Delete File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{selectedFile?.file_name}"?
              This action cannot be undone and the file will be completely removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Restore File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{selectedFile?.file_name}" to its original location?
              The file will be moved back to "{selectedFile?.original_path}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Restore File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Warning Dialog */}
      <AlertDialog open={downloadConfirmOpen} onOpenChange={setDownloadConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Security Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedFile?.file_name}" was quarantined because it was detected as malicious.
              Downloading this file could pose a security risk to your system.
              Only proceed if you are certain this file is safe and you know what you're doing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDownload}>
              Download Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Quarantine;