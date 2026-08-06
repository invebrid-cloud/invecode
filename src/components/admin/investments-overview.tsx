import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cryptoInvestments, stockInvestments, type Investment } from "@/lib/data";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function InvestmentsOverview() {
    return (
        <Card className="shadow-md border-border">
            <CardHeader>
                <CardTitle>Market Overview</CardTitle>
                <CardDescription>Explore popular assets in the crypto and stock markets.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="crypto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="crypto">Crypto</TabsTrigger>
                        <TabsTrigger value="stocks">Stocks</TabsTrigger>
                    </TabsList>
                    <TabsContent value="crypto" className="mt-4">
                        <InvestmentTable data={cryptoInvestments} />
                    </TabsContent>
                    <TabsContent value="stocks" className="mt-4">
                        <InvestmentTable data={stockInvestments} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function InvestmentTable({ data }: { data: Investment[] }) {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">24h Change</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => {
                        const isPositive = item.change >= 0;
                        const changeColor = isPositive ? 'hsl(var(--accent))' : 'hsl(var(--destructive))';
                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <item.Icon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">{item.id}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right hidden sm:table-cell">
                                    <div className="flex items-center justify-end" style={{ color: changeColor }}>
                                        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                                        {item.change.toFixed(1)}%
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
