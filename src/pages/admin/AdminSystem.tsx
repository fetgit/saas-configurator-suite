import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Activity, 
  Server, 
  Database, 
  Settings, 
  Download, 
  Upload, 
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Cpu,
  MonitorSpeaker,
  Network,
  Users,
  FileText,
  Shield,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkTraffic: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  lastCheck: string;
}

interface DatabaseInfo {
  name: string;
  size: string;
  tables: number;
  connections: number;
  lastBackup: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  service: string;
  message: string;
}

const AdminSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Mock data - replace with actual API calls
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    uptime: '15 days, 3 hours',
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 34,
    networkTraffic: 125,
    activeUsers: 1247,
    totalRequests: 89542,
    errorRate: 0.3
  });

  const [services, setServices] = useState<ServiceStatus[]>([
    { id: '1', name: 'Web Server', status: 'healthy', uptime: '15d 3h', lastCheck: '2 min ago' },
    { id: '2', name: 'Database', status: 'healthy', uptime: '15d 3h', lastCheck: '1 min ago' },
    { id: '3', name: 'Cache Service', status: 'warning', uptime: '12d 1h', lastCheck: '3 min ago' },
    { id: '4', name: 'Email Service', status: 'healthy', uptime: '15d 3h', lastCheck: '1 min ago' },
    { id: '5', name: 'File Storage', status: 'error', uptime: '0d 2h', lastCheck: '5 min ago' }
  ]);

  const [databases, setDatabases] = useState<DatabaseInfo[]>([
    { name: 'main_db', size: '2.3 GB', tables: 45, connections: 12, lastBackup: '2 hours ago' },
    { name: 'analytics_db', size: '850 MB', tables: 23, connections: 5, lastBackup: '4 hours ago' },
    { name: 'logs_db', size: '1.2 GB', tables: 8, connections: 3, lastBackup: '1 hour ago' }
  ]);

  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '2024-01-20 14:32:15', level: 'info', service: 'Web Server', message: 'Server started successfully' },
    { id: '2', timestamp: '2024-01-20 14:30:45', level: 'warning', service: 'Cache Service', message: 'High memory usage detected' },
    { id: '3', timestamp: '2024-01-20 14:28:20', level: 'error', service: 'File Storage', message: 'Connection timeout to storage backend' },
    { id: '4', timestamp: '2024-01-20 14:25:10', level: 'info', service: 'Database', message: 'Backup completed successfully' }
  ]);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        networkTraffic: Math.max(50, Math.min(200, prev.networkTraffic + (Math.random() - 0.5) * 20))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleServiceRestart = async (serviceId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: 'healthy', lastCheck: 'just now' }
          : service
      ));
      
      toast.success('Service restarted successfully');
    } catch (error) {
      toast.error('Failed to restart service');
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseBackup = async (dbName: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDatabases(prev => prev.map(db => 
        db.name === dbName 
          ? { ...db, lastBackup: 'just now' }
          : db
      ));
      
      toast.success(`Database ${dbName} backed up successfully`);
    } catch (error) {
      toast.error('Database backup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      toast.success('System updated successfully');
    } catch (error) {
      toast.error('System update failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning': return 'bg-warning/20 text-warning-foreground';
      case 'error': return 'bg-destructive/20 text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">Monitor and manage system resources and services</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={maintenanceMode ? "destructive" : "secondary"}>
            {maintenanceMode ? "Maintenance Mode" : "Active"}
          </Badge>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${systemMetrics.cpuUsage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <MonitorSpeaker className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.memoryUsage}%</div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all"
                    style={{ width: `${systemMetrics.memoryUsage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.diskUsage}%</div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${systemMetrics.diskUsage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Online now</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-semibold">{systemMetrics.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Requests:</span>
                  <span className="font-semibold">{systemMetrics.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className="font-semibold text-success">{systemMetrics.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Traffic:</span>
                  <span className="font-semibold">{systemMetrics.networkTraffic} MB/s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Service Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.slice(0, 4).map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        <span className="text-sm">{service.name}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Uptime: {service.uptime} • Last check: {service.lastCheck}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <Button
                        onClick={() => handleServiceRestart(service.id)}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databases.map((db, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{db.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Size: {db.size} • Tables: {db.tables} • Connections: {db.connections}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last backup: {db.lastBackup}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleDatabaseBackup(db.name)}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Backup
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Logs
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border-l-4 border-l-muted">
                    <Badge className={getLogLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{log.service}</span>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{log.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  System Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleSystemUpdate}
                  disabled={loading}
                  className="w-full"
                  variant="default"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Update System
                </Button>
                <Button
                  onClick={() => toast.success('Cache cleared successfully')}
                  className="w-full"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button
                  onClick={() => toast.success('System optimized successfully')}
                  className="w-full"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Backup & Recovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Full System Backup
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
                <div className="text-sm text-muted-foreground">
                  Last full backup: 2 hours ago
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Enable daily system backups</p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed logging</p>
                  </div>
                  <Switch
                    id="debug-mode"
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-users">Maximum Concurrent Users</Label>
                  <Input id="max-users" type="number" defaultValue="5000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                  <Input id="max-file-size" type="number" defaultValue="100" />
                </div>

                <Button className="w-full">Save Configuration</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSystem;