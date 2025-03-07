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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { DividendData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");

  const { data: dividends, isLoading } = useQuery<DividendData[]>({
    queryKey: ["/api/dividends"],
  });

  const sectors = Array.from(new Set(dividends?.map(d => d.sector) || []));

  const filteredDividends = dividends?.filter(
    (dividend) =>
      (dividend.companyName.toLowerCase().includes(search.toLowerCase()) ||
       dividend.ticker.toLowerCase().includes(search.toLowerCase())) &&
      (selectedSector === "all" || dividend.sector === selectedSector)
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
        <CardContent className="flex gap-4">
          <Input
            placeholder="Search by company name or ticker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Established</TableHead>
              <TableHead>Quoted Date</TableHead>
              <TableHead>FY Ending</TableHead>
              <TableHead>Dividend Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Yield</TableHead>
              <TableHead>Year-wise Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDividends?.map((dividend) => (
              <TableRow key={dividend.id}>
                <TableCell>{dividend.companyName}</TableCell>
                <TableCell>{dividend.ticker}</TableCell>
                <TableCell>{dividend.sector}</TableCell>
                <TableCell>{dividend.established}</TableCell>
                <TableCell>{dividend.quotedDate}</TableCell>
                <TableCell>{dividend.fyEnding}</TableCell>
                <TableCell>{dividend.dividendAmount}</TableCell>
                <TableCell className="capitalize">{dividend.frequency}</TableCell>
                <TableCell>{dividend.yield}%</TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {dividend.yearWiseData.map((data) => (
                      <div key={data}>{data}</div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}