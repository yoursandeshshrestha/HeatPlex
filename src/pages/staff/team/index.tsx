/**
 * Staff List Page
 * Staff view to see and manage team members
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, UserCog, Users, Shield, Crown } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

type Staff = Tables<'staff'>;

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </Card>
  );
}

export function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredStaff = staff.filter(
    (member) =>
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleStyles = {
    owner: 'bg-purple-500/10 text-purple-400 backdrop-blur-sm hover:bg-purple-500/15',
    admin: 'bg-blue-500/10 text-blue-400 backdrop-blur-sm hover:bg-blue-500/15',
    staff: 'bg-gray-500/10 text-gray-400 backdrop-blur-sm hover:bg-gray-500/15',
  };

  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/15',
    inactive: 'bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/15',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage Heat Plex team members and permissions
          </p>
        </div>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={staff.length}
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Active"
          value={staff.filter((s) => !s.deactivated_at).length}
          icon={<UserCog className="size-4" />}
        />
        <StatCard
          title="Admins"
          value={staff.filter((s) => s.role === 'admin').length}
          icon={<Shield className="size-4" />}
        />
        <StatCard
          title="Owners"
          value={staff.filter((s) => s.role === 'owner').length}
          icon={<Crown className="size-4" />}
        />
      </div>

      {/* Table */}
      <Card>
        <div className="flex items-center justify-between border-b p-4">
          <div className="text-sm font-medium">
            Team Members
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[240px] cursor-text rounded-md pl-8 text-sm"
            />
          </div>
        </div>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="px-6 font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Last Login</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
                <TableHead className="px-6 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id} className="cursor-pointer border-b transition-colors hover:bg-muted/50">
                    <TableCell className="px-6 py-4 font-medium">{member.name}</TableCell>
                    <TableCell className="py-4 text-muted-foreground">{member.email}</TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="secondary"
                        className={`capitalize ${roleStyles[member.role as keyof typeof roleStyles] || ''}`}
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="secondary"
                        className={member.deactivated_at ? statusStyles.inactive : statusStyles.active}
                      >
                        {member.deactivated_at ? 'Inactive' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {member.last_login_at ? formatDate(member.last_login_at) : 'Never'}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {formatDate(member.created_at)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 cursor-pointer hover:bg-accent">
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
