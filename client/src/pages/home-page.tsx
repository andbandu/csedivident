import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DividendData } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [search, setSearch] = useState("");

  const { data: dividends, isLoading } = useQuery<DividendData[]>({
    queryKey: ["/api/dividends"],
  });

  const filteredDividends = dividends?.filter(
    (dividend) =>
      dividend.companyName.toLowerCase().includes(search.toLowerCase()) ||
      dividend.ticker.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dividend Data</h1>
        <p className="text-muted-foreground">
          Track and monitor dividend payments from various companies
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by company name or ticker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Dividend Amount</TableHead>
              <TableHead>Ex-Date</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Yield</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDividends?.map((dividend) => (
              <TableRow key={dividend.id}>
                <TableCell>{dividend.companyName}</TableCell>
                <TableCell>{dividend.ticker}</TableCell>
                <TableCell>${Number(dividend.dividendAmount).toFixed(2)}</TableCell>
                <TableCell>{format(new Date(dividend.exDate), "PP")}</TableCell>
                <TableCell>
                  {format(new Date(dividend.paymentDate), "PP")}
                </TableCell>
                <TableCell className="capitalize">{dividend.frequency}</TableCell>
                <TableCell>{Number(dividend.yield).toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}