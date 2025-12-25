import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Database,
    Search,
    Download,
    Leaf,
    Dna,
    CloudSun,
    Loader2,
} from 'lucide-react';
import { cropApi } from '@/lib/api';

export default function DataExplorer() {
    const [crops, setCrops] = useState<any[]>([]);
    const [traits, setTraits] = useState<any[]>([]);
    const [climate, setClimate] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [cropsData, traitsData, climateData] = await Promise.all([
                cropApi.getAll(),
                cropApi.getTraits(),
                cropApi.getClimate(),
            ]);
            setCrops(cropsData);
            setTraits(traitsData);
            setClimate(climateData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterData = (data: any[], term: string) => {
        if (!term) return data;
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(term.toLowerCase())
            )
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-foreground">Data Explorer</h1>
                        <p className="text-muted-foreground mt-2">
                            Browse and search research database records
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search all records..."
                                className="pl-10 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </motion.div>

                {/* Data Tables */}
                <Card className="border-2 shadow-lg">
                    <CardContent className="p-6">
                        <Tabs defaultValue="crops" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="crops" className="gap-2">
                                    <Leaf className="w-4 h-4" />
                                    Crops ({crops.length})
                                </TabsTrigger>
                                <TabsTrigger value="traits" className="gap-2">
                                    <Dna className="w-4 h-4" />
                                    Genetic Traits ({traits.length})
                                </TabsTrigger>
                                <TabsTrigger value="climate" className="gap-2">
                                    <CloudSun className="w-4 h-4" />
                                    Climate Data ({climate.length})
                                </TabsTrigger>
                            </TabsList>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="crops">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="text-left p-3 font-semibold">Crop Name</th>
                                                        <th className="text-left p-3 font-semibold">Variety</th>
                                                        <th className="text-left p-3 font-semibold">Yield Potential</th>
                                                        <th className="text-left p-3 font-semibold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filterData(crops, searchTerm).map((crop, i) => (
                                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                                            <td className="p-3 font-medium">{crop.name}</td>
                                                            <td className="p-3 text-muted-foreground">{crop.variety}</td>
                                                            <td className="p-3 text-muted-foreground">{crop.yieldPotential}</td>
                                                            <td className="p-3">
                                                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                                                    {crop.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="traits">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="text-left p-3 font-semibold">Marker ID</th>
                                                        <th className="text-left p-3 font-semibold">Crop</th>
                                                        <th className="text-left p-3 font-semibold">Trait Affected</th>
                                                        <th className="text-left p-3 font-semibold">Effect</th>
                                                        <th className="text-left p-3 font-semibold">Confidence</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filterData(traits, searchTerm).map((trait, i) => (
                                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                                            <td className="p-3 font-mono text-sm">{trait.markerId}</td>
                                                            <td className="p-3">{trait.crop}</td>
                                                            <td className="p-3 text-muted-foreground">{trait.traitAffected}</td>
                                                            <td className="p-3">
                                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                                                    {trait.effectType}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">{trait.confidenceScore}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="climate">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="text-left p-3 font-semibold">Location</th>
                                                        <th className="text-left p-3 font-semibold">Temperature</th>
                                                        <th className="text-left p-3 font-semibold">Rainfall</th>
                                                        <th className="text-left p-3 font-semibold">Humidity</th>
                                                        <th className="text-left p-3 font-semibold">Season</th>
                                                        <th className="text-left p-3 font-semibold">Year</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filterData(climate, searchTerm).map((record, i) => (
                                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                                            <td className="p-3 font-medium">{record.location}</td>
                                                            <td className="p-3 text-muted-foreground">{record.tempAvg}</td>
                                                            <td className="p-3 text-muted-foreground">{record.rainfall}</td>
                                                            <td className="p-3 text-muted-foreground">{record.humidity}</td>
                                                            <td className="p-3 text-muted-foreground">{record.season}</td>
                                                            <td className="p-3 text-muted-foreground">{record.year}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                </>
                            )}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
