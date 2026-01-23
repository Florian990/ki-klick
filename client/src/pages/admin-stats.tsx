import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, endOfDay, subDays, endOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Users, UserPlus, UserCheck, Mail, Play, CheckCircle, XCircle, BarChart3 } from "lucide-react";

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  returningVisitors: number;
  newVisitors: number;
  leadsGenerated: number;
  quizStarted: number;
  quizCompleted: number;
  quizDisqualified: number;
}

export default function AdminStats() {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: startOfDay(startDate).toISOString(),
        endDate: endOfDay(endDate).toISOString(),
      });
      const response = await fetch(`/api/analytics/stats?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const setPresetRange = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case "today":
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case "7days":
        setStartDate(subDays(now, 7));
        setEndDate(now);
        break;
      case "30days":
        setStartDate(subDays(now, 30));
        setEndDate(now);
        break;
      case "january":
        setStartDate(new Date(now.getFullYear(), 0, 1));
        setEndDate(endOfMonth(new Date(now.getFullYear(), 0, 1)));
        break;
      case "december":
        setStartDate(new Date(now.getFullYear() - 1, 11, 1));
        setEndDate(endOfMonth(new Date(now.getFullYear() - 1, 11, 1)));
        break;
      case "november":
        setStartDate(new Date(now.getFullYear() - 1, 10, 1));
        setEndDate(endOfMonth(new Date(now.getFullYear() - 1, 10, 1)));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Statistiken</h1>
        <p className="text-gray-400 mb-8">Übersicht über Besucher und Quiz-Performance</p>

        {/* Date Range Selector */}
        <Card className="bg-[#111] border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CalendarIcon className="w-5 h-5" />
              Zeitraum auswählen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => setPresetRange("today")}>Heute</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("7days")}>Letzte 7 Tage</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("30days")}>Letzte 30 Tage</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("january")}>Januar</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("december")}>Dezember</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange("november")}>November</Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Von</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "dd.MM.yyyy", { locale: de })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-gray-700">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Bis</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "dd.MM.yyyy", { locale: de })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-gray-700">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button onClick={fetchStats} className="mt-5 bg-amber-600 hover:bg-amber-700">
                Filtern
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-8">Lade Daten...</div>
        ) : data ? (
          <>
            {/* Visitor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-[#111] border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{data.totalPageViews}</p>
                      <p className="text-sm text-gray-400">Seitenaufrufe</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <UserPlus className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{data.uniqueVisitors}</p>
                      <p className="text-sm text-gray-400">Einzigartige Besucher</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <UserCheck className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{data.returningVisitors}</p>
                      <p className="text-sm text-gray-400">Wiederkehrend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Mail className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{data.leadsGenerated}</p>
                      <p className="text-sm text-gray-400">Leads generiert</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz Stats */}
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quiz-Statistiken
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#111] border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Play className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{data.quizStarted}</p>
                      <p className="text-sm text-gray-400">Quiz gestartet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{data.quizCompleted}</p>
                      <p className="text-sm text-gray-400">Quiz abgeschlossen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{data.quizDisqualified}</p>
                      <p className="text-sm text-gray-400">Disqualifiziert</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">Keine Daten verfügbar</div>
        )}
      </div>
    </div>
  );
}
