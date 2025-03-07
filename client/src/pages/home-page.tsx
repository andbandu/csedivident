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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DividendData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [openHistoricalData, setOpenHistoricalData] = useState<Record<number, boolean>>({});

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

  // Helper function to get dividend amount for a specific year
  const getDividendForYear = (yearWiseData: string[], year: number): string => {
    const data = yearWiseData.find(d => d.startsWith(`${year}:`));
    return data ? data.split(':')[1] : '-';
  };

  // Helper function to get historical data (before 2021)
  const getHistoricalData = (yearWiseData: string[]): string[] => {
    return yearWiseData
      .filter(d => parseInt(d.split(':')[0]) < 2021)
      .sort((a, b) => b.split(':')[0].localeCompare(a.split(':')[0]));
  };

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
              <TableHead>Frequency</TableHead>
              <TableHead>2023</TableHead>
              <TableHead>2022</TableHead>
              <TableHead>2021</TableHead>
              <TableHead>Historical</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDividends?.map((dividend) => {
              const historicalData = getHistoricalData(dividend.yearWiseData);
              return (
                <TableRow key={dividend.id}>
                  <TableCell className="font-medium">{dividend.companyName}</TableCell>
                  <TableCell className="font-medium text-primary">{dividend.ticker}</TableCell>
                  <TableCell>{dividend.sector}</TableCell>
                  <TableCell>{dividend.established}</TableCell>
                  <TableCell>{dividend.quotedDate}</TableCell>
                  <TableCell>{dividend.fyEnding}</TableCell>
                  <TableCell className="capitalize">{dividend.frequency}</TableCell>
                  <TableCell className="font-semibold">{getDividendForYear(dividend.yearWiseData, 2023)}</TableCell>
                  <TableCell className="font-semibold">{getDividendForYear(dividend.yearWiseData, 2022)}</TableCell>
                  <TableCell className="font-semibold">{getDividendForYear(dividend.yearWiseData, 2021)}</TableCell>
                  <TableCell>
                    {historicalData.length > 0 && (
                      <Collapsible
                        open={openHistoricalData[dividend.id]}
                        onOpenChange={(isOpen) => 
                          setOpenHistoricalData(prev => ({ ...prev, [dividend.id]: isOpen }))
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full">
                            {openHistoricalData[dividend.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="ml-2">
                              {historicalData.length} years of history
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="grid grid-cols-3 gap-4">
                              {historicalData.map((data) => {
                                const [year, amount] = data.split(':');
                                return (
                                  <div key={year} className="flex items-center gap-2">
                                    <span className="font-medium">{year}:</span>
                                    <span>{amount}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}