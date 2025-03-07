import { useQuery, useMutation } from "@tanstack/react-query";
import { DividendData, insertDividendSchema, InsertDividend } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Pencil, ChevronLeft } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@radix-ui/react-collapsible';

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const { data: dividends, isLoading } = useQuery<DividendData[]>({
    queryKey: ["/api/dividends"],
  });

  const form = useForm({
    resolver: zodResolver(insertDividendSchema),
    defaultValues: {
      companyName: "",
      ticker: "",
      sector: "",
      established: 2000,
      quotedDate: 2000,
      fyEnding: "December",
      dividendAmount: "0.00",
      frequency: "annual" as const,
      yield: "0.00",
      yearWiseData: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDividend) => {
      const yearData = `${new Date().getFullYear()}:${data.dividendAmount}`;
      const updatedData = {
        ...data,
        yearWiseData: [...data.yearWiseData, yearData],
      };
      const res = await apiRequest("POST", "/api/dividends", updatedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dividends"] });
      toast({
        title: "Success",
        description: "Dividend data created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/dividends/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dividends"] });
      toast({
        title: "Success",
        description: "Dividend data deleted successfully",
      });
    },
  });

  const [editingDividend, setEditingDividend] = useState<DividendData | null>(null);
  const [addingYearData, setAddingYearData] = useState<number | null>(null);
  const yearDataForm = useForm({
    defaultValues: {
      year: new Date().getFullYear(),
      amount: "0.00"
    }
  });

  const editMutation = useMutation({
    mutationFn: async (data: { id: number; dividend: Partial<InsertDividend> }) => {
      const res = await apiRequest("PATCH", `/api/dividends/${data.id}`, data.dividend);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dividends"] });
      toast({
        title: "Success",
        description: "Dividend data updated successfully",
      });
      setEditingDividend(null);
    },
  });

  const addYearDataMutation = useMutation({
    mutationFn: async (data: { id: number; year: number; amount: string }) => {
      const res = await apiRequest("POST", `/api/dividends/${data.id}/year`, {
        year: data.year,
        amount: data.amount
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dividends"] });
      toast({
        title: "Success",
        description: "Year data added successfully",
      });
      setAddingYearData(null);
      yearDataForm.reset();
    },
  });

  const [openHistoricalData, setOpenHistoricalData] = useState<{ [key: number]: boolean }>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}
          </p>
        </div>
        <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
          Logout
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Dividend Data</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ticker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticker</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="established"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Established Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quotedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quoted Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fyEnding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FY Ending</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "January", "February", "March", "April",
                              "May", "June", "July", "August",
                              "September", "October", "November", "December"
                            ].map((month) => (
                              <SelectItem key={month} value={month}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dividendAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dividend Amount</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Dividend Data
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Established</TableHead>
              <TableHead>Quoted Date</TableHead>
              <TableHead>FY Ending</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>2023</TableHead>
              <TableHead>2022</TableHead>
              <TableHead>2021</TableHead>
              <TableHead>Historical Data</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dividends?.map((dividend) => {
              const historicalData = dividend.yearWiseData
                .filter(d => parseInt(d.split(':')[0]) < 2024)
                .sort((a, b) => b.split(':')[0].localeCompare(a.split(':')[0]));

              return (
                <>
                  <TableRow key={dividend.id}>
                    <TableCell className="font-medium">{dividend.companyName} <span className="text-primary text-xs">({dividend.ticker})</span></TableCell>
                    <TableCell>{dividend.sector}</TableCell>
                    <TableCell>{dividend.established}</TableCell>
                    <TableCell>{dividend.quotedDate}</TableCell>
                    <TableCell>{dividend.fyEnding}</TableCell>
                    <TableCell className="capitalize">{dividend.frequency}</TableCell>
                    <TableCell className="font-semibold">
                      {dividend.yearWiseData.find(d => d.startsWith('2023:'))?.split(':')[1] || '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {dividend.yearWiseData.find(d => d.startsWith('2022:'))?.split(':')[1] || '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {dividend.yearWiseData.find(d => d.startsWith('2021:'))?.split(':')[1] || '-'}
                    </TableCell>
                    <TableCell>
                      <Collapsible
                        open={openHistoricalData?.[dividend.id] || false}
                        onOpenChange={(isOpen) =>
                          setOpenHistoricalData(prev => ({ ...prev, [dividend.id]: isOpen }))
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`transition-colors hover:bg-muted ${
                              openHistoricalData?.[dividend.id] ? 'bg-muted' : ''
                            }`}
                          >
                            <ChevronLeft className={`h-4 w-4 transition-transform ${
                              openHistoricalData?.[dividend.id] ? 'rotate-180' : ''
                            }`} />
                            <span className="ml-2">
                              View {historicalData.length} years
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {openHistoricalData?.[dividend.id] && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={12}>
                                <div className="p-4 bg-card rounded-md w-full">
                                  <h4 className="font-medium mb-2">Dividend History</h4>
                                  <div className="overflow-x-auto">
                                    <div className="historical-data-table">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            {historicalData.map((data) => {
                                              const [year] = data.split(':');
                                              return <TableHead key={year}>{year}</TableHead>;
                                            })}
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          <TableRow>
                                            {historicalData.map((data) => {
                                              const [year, amount] = data.split(':');
                                              return <TableCell key={year}>${amount}</TableCell>;
                                            })}
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setAddingYearData(dividend.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Year Data</DialogTitle>
                            </DialogHeader>
                            <Form {...yearDataForm}>
                              <form
                                onSubmit={yearDataForm.handleSubmit((data) =>
                                  addYearDataMutation.mutate({
                                    id: dividend.id,
                                    year: parseInt(data.year.toString()),
                                    amount: data.amount
                                  })
                                )}
                                className="space-y-4"
                              >
                                <FormField
                                  control={yearDataForm.control}
                                  name="year"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Year</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          {...field}
                                          min={1800}
                                          max={new Date().getFullYear()}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={yearDataForm.control}
                                  name="amount"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Dividend Amount</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button
                                  type="submit"
                                  className="w-full"
                                  disabled={addYearDataMutation.isPending}
                                >
                                  {addYearDataMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Add Year Data
                                </Button>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingDividend(dividend)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Company Data</DialogTitle>
                            </DialogHeader>
                            <Form {...form} defaultValues={editingDividend}>
                              <form
                                onSubmit={form.handleSubmit((data) =>
                                  editMutation.mutate({ id: editingDividend!.id, dividend: data })
                                )}
                                className="space-y-4"
                              >
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="ticker"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Ticker</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  {/* ...Rest of the fields for editing */}
                                  <FormField
                                    control={form.control}
                                    name="frequency"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Frequency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="annual">Annual</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <Button type="submit" className="w-full mt-6" disabled={editMutation.isPending}>
                                  {editMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Update Dividend Data
                                </Button>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteMutation.mutate(dividend.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}