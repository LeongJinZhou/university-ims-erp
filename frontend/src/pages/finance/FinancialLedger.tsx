import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { financeApi } from '../../lib/api';

type Invoice = {
  id: string;
  invoiceNumber: string;
  student: {
    name: string;
    studentId: string;
  };
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  dueDate: string;
  issuedAt: string;
  invoiceItems: Array<{
    id: string;
    description: string;
    feeType: string;
    creditHours?: number;
    unitAmount: number;
    totalAmount: number;
  }>;
};

export function FinancialLedger() {
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await financeApi.getInvoices();
      return data;
    },
  });

  if (isLoading) return <LedgerSkeleton />;
  if (error) return <div className="p-6 text-red-600">Error loading financial ledger</div>;

  const totalOutstanding = invoices?.reduce((sum: number, inv: Invoice) => sum + inv.balance, 0) || 0;
  const totalCollected = invoices?.reduce((sum: number, inv: Invoice) => sum + inv.paidAmount, 0) || 0;
  const overdueCount = invoices?.filter((inv: Invoice) =>
    inv.status === 'UNPAID' && new Date(inv.dueDate) < new Date()
  ).length || 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Financial Ledger</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Invoice and payment tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">MYR {totalCollected.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">MYR {totalOutstanding.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Overdue Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Invoice List</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {invoices?.length || 0} invoices</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Invoice #</TableHead>
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Paid</TableHead>
                <TableHead className="font-semibold">Balance</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((inv: Invoice) => (
                <TableRow key={inv.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {inv.student?.name} ({inv.student?.studentId})
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">MYR {inv.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">MYR {inv.paidAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-amber-600">MYR {inv.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      inv.status === 'PAID' ? 'default' :
                      inv.status === 'PARTIAL' ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Invoice Details</CardTitle>
          <CardDescription className="text-sm text-slate-500">Course breakdown by invoice</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {invoices?.map((inv: Invoice) => (
            <div key={`details-${inv.id}`} className="mb-6 last:mb-0">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{inv.invoiceNumber}</h4>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-800">
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Credits</TableHead>
                    <TableHead className="font-semibold">Rate</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inv.invoiceItems?.map((item) => (
                    <TableRow key={item.id} className="border-slate-200 dark:border-slate-800">
                      <TableCell className="text-slate-700 dark:text-slate-300">{item.description}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{item.feeType}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{item.creditHours || '-'}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">MYR {item.unitAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">MYR {item.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LedgerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}