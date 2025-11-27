"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Match, Log } from "@/types";
import {
  ArrowLeft,
  Trophy,
  Flag,
  Square,
  Clock,
  Calendar,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function MatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  // eslint-disable-next-line react-hooks/purity
  const [currentTime, setCurrentTime] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const url = `${process.env.NEXT_PUBLIC_API_URL}/events/matches/${id}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data: Match = JSON.parse(event.data);
        setMatch(data);
      } catch (err) {
        console.error("Failed to parse match data", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    const timerInterval = setInterval(() => setCurrentTime(Date.now()), 30000);

    return () => {
      eventSource.close();
      clearInterval(timerInterval);
    };
  }, [id]);

  const getMatchTime = () => {
    if (!match) return "00'";
    if (match.status === "scheduled") return "00'";
    if (match.status === "finished") return "FT";

    if (!match.startTime) return "00'";

    const diff = Math.floor((currentTime - match.startTime) / 60000);
    if (diff > 120) return "FT"; // Fallback if admin forgot to end
    if (diff > 90) return `90+${diff - 90}'`;
    return `${diff}'`;
  };

  // 3. Helper: Get Icon based on event type
  const getEventIcon = (type: Log["type"]) => {
    switch (type) {
      case "goal":
        return <Trophy className="h-5 w-5 text-emerald-500" />;
      case "card_yellow":
        return <Square className="h-5 w-5 fill-yellow-400 text-yellow-500" />;
      case "card_red":
        return <Square className="h-5 w-5 fill-red-600 text-red-600" />;
      case "corner":
        return <Flag className="h-5 w-5 text-blue-500" />;
      case "foul":
        return <Activity className="h-5 w-5 text-orange-500" />;
      case "start":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "end":
        return <Calendar className="h-5 w-5 text-gray-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="h-10 w-10 text-slate-300 mb-4 animate-spin" />
          <p className="text-slate-500">Connecting to Stadium Feed...</p>
        </div>
      </div>
    );
  }

  // Derived Stats
  const homeYellows = match.logs.filter(
    (l) => l.team === "A" && l.type === "card_yellow"
  ).length;
  const awayYellows = match.logs.filter(
    (l) => l.team === "B" && l.type === "card_yellow"
  ).length;
  const homeReds = match.logs.filter(
    (l) => l.team === "A" && l.type === "card_red"
  ).length;
  const awayReds = match.logs.filter(
    (l) => l.team === "B" && l.type === "card_red"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
              <ArrowLeft className="h-4 w-4" /> Back to Match List
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <Card className="overflow-hidden border-0 shadow-lg bg-slate-900 text-white mb-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-white to-red-500 opacity-20"></div>

          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              {match.status === "live" && (
                <Badge
                  variant="destructive"
                  className="animate-pulse px-4 py-1 text-sm font-bold tracking-widest bg-red-600"
                >
                  LIVE • {getMatchTime()}
                </Badge>
              )}
              {match.status === "finished" && (
                <Badge
                  variant="secondary"
                  className="px-4 py-1 text-sm bg-slate-700 text-slate-200"
                >
                  FULL TIME
                </Badge>
              )}
              {match.status === "scheduled" && (
                <Badge
                  variant="outline"
                  className="px-4 py-1 text-sm border-slate-600 text-slate-400"
                >
                  UPCOMING
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                  {match.teamA}
                </h2>
                <div className="flex justify-center gap-2 text-xs text-slate-400 font-mono">
                  {homeYellows > 0 && (
                    <span className="flex items-center gap-1">
                      <Square className="h-3 w-3 fill-yellow-500 text-yellow-500" />{" "}
                      {homeYellows}
                    </span>
                  )}
                  {homeReds > 0 && (
                    <span className="flex items-center gap-1">
                      <Square className="h-3 w-3 fill-red-600 text-red-600" />{" "}
                      {homeReds}
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="mx-4 md:mx-10 min-w-[120px] text-center">
                <div className="text-5xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums">
                  {match.scoreA} - {match.scoreB}
                </div>
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                  {match.teamB}
                </h2>
                <div className="flex justify-center gap-2 text-xs text-slate-400 font-mono">
                  {awayYellows > 0 && (
                    <span className="flex items-center gap-1">
                      <Square className="h-3 w-3 fill-yellow-500 text-yellow-500" />{" "}
                      {awayYellows}
                    </span>
                  )}
                  {awayReds > 0 && (
                    <span className="flex items-center gap-1">
                      <Square className="h-3 w-3 fill-red-600 text-red-600" />{" "}
                      {awayReds}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="hidden md:block col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase text-slate-500">
                  Match Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium capitalize">{match.status}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Stadium</span>
                  <span className="font-medium">Wembley (Demo)</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Referee</span>
                  <span className="font-medium">M. Oliver (Demo)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Timeline */}
          <div className="col-span-1 md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" /> Match
                  Commentary
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-6" ref={scrollRef}>
                  <div className="space-y-6 relative border-l-2 border-slate-100 ml-3 pl-6">
                    {match.logs.length === 0 && (
                      <div className="text-center text-slate-400 py-10 italic">
                        Match events will appear here live...
                      </div>
                    )}

                    {/* Reverse logs to show newest first */}
                    {[...match.logs].reverse().map((log, i) => (
                      <div key={i} className="relative group">
                        {/* Timeline Dot */}
                        <div
                          className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm
                                            ${
                                              log.type === "goal"
                                                ? "bg-emerald-500"
                                                : log.type.includes("card")
                                                ? "bg-yellow-500"
                                                : "bg-slate-300"
                                            }`}
                        />

                        {/* Time & Event */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 mb-1">
                          <span className="font-mono font-bold text-slate-500 text-sm min-w-12">
                            {log.time}
                          </span>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold text-slate-800">
                              {getEventIcon(log.type)}
                              <span>
                                {log.type === "goal" && "GOAL!"}
                                {log.type === "card_yellow" && "Yellow Card"}
                                {log.type === "card_red" && "RED CARD"}
                                {log.type === "corner" && "Corner Kick"}
                                {log.type === "foul" && "Foul"}
                                {log.type === "start" && "Kick Off"}
                                {log.type === "end" && "Full Time"}
                              </span>
                            </div>

                            {/* Description / Player Name */}
                            <div className="text-slate-600 mt-1 pl-7">
                              {log.player && (
                                <span className="font-bold text-slate-900">
                                  {log.player}{" "}
                                </span>
                              )}
                              <span className="text-sm">
                                {log.type === "goal" &&
                                  `scores for ${
                                    log.team === "A" ? match.teamA : match.teamB
                                  }!`}
                                {log.description &&
                                  !log.player &&
                                  log.description}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
