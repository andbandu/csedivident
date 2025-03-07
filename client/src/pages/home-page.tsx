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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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

  const getCurrentYear = () => new Date().getFullYear();
  const years = [getCurrentYear(), getCurrentYear() - 1, getCurrentYear() - 2];

  const getDividendForYear = (yearWiseData: string[], year: number): string => {
    const data = yearWiseData.find(d => d.startsWith(`${year}:`));
    return data ? data.split(':')[1] : '-';
  };

  const getHistoricalData = (yearWiseData: string[]): string[] => {
    return yearWiseData
      .filter(d => parseInt(d.split(':')[0]) < Math.min(...years))
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dividend Data Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track and analyze dividend payments from various companies across different sectors
          </p>
        </div>

        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle>Search & Filter Companies</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
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
                <TableHead>Sector</TableHead>
                <TableHead>Established</TableHead>
                <TableHead>Quoted Date</TableHead>
                <TableHead>FY Ending</TableHead>
                <TableHead>Frequency</TableHead>
                {years.map(year => (
                  <TableHead key={year}>{year}</TableHead>
                ))}
                <TableHead>History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDividends?.map((dividend) => {
                const historicalData = getHistoricalData(dividend.yearWiseData);
                return (
                  <>
                  <TableRow key={dividend.id}>
                    <TableCell className="font-medium">{dividend.companyName} <span className="text-primary text-xs">({dividend.ticker})</span></TableCell>
                    <TableCell>{dividend.sector}</TableCell>
                    <TableCell>{dividend.established}</TableCell>
                    <TableCell>{dividend.quotedDate}</TableCell>
                    <TableCell>{dividend.fyEnding}</TableCell>
                    <TableCell className="capitalize">{dividend.frequency}</TableCell>
                    {years.map(year => (
                      <TableCell key={year} className="font-semibold">
                        {getDividendForYear(dividend.yearWiseData, year)}
                      </TableCell>
                    ))}
                    <TableCell>
                      {historicalData.length > 0 && (
                        <Collapsible
                          open={openHistoricalData[dividend.id]}
                          onOpenChange={(isOpen) =>
                            setOpenHistoricalData(prev => ({ ...prev, [dividend.id]: isOpen }))
                          }
                        >
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`w-full transition-colors hover:bg-muted ${
                                openHistoricalData[dividend.id] ? 'bg-muted' : ''
                              }`}
                            >
                              <ChevronLeft className={`h-4 w-4 transition-transform ${
                                openHistoricalData[dividend.id] ? 'rotate-180' : ''
                              }`} />
                              <span className="ml-2">
                                View {historicalData.length} years
                              </span>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="animate-fade-in">
                            {/* Expanded row will be rendered here */}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </TableCell>
                  </TableRow>
                  {openHistoricalData[dividend.id] && (
                    <TableRow className="bg-muted/30 border-t-0">
                      <TableCell colSpan={6 + years.length + 1} className="p-2">
                        <div className="p-4 bg-card border rounded-md shadow-md">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <tbody>
                                <tr>
                                  <th className="text-left px-3 py-2 w-24">Year</th>
                                  {historicalData.map((data) => {
                                    const [year] = data.split(':');
                                    return (
                                      <td key={year} className="text-center px-3 py-2">{year}</td>
                                    );
                                  })}
                                </tr>
                                <tr>
                                  <th className="text-left px-3 py-2">Dividend</th>
                                  {historicalData.map((data) => {
                                    const [year, amount] = data.split(':');
                                    return (
                                      <td key={year} className="text-center font-medium px-3 py-2">${amount}</td>
                                    );
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}