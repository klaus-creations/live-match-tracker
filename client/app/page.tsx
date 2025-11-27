"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Match } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  // eslint-disable-next-line react-hooks/purity
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/events/matches`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data: Match[] = JSON.parse(event.data);
        // Sort: Live first, then Scheduled, then Finished
        const sorted = data.sort((a, b) => {
          if (a.status === "live" && b.status !== "live") return -1;
          if (b.status === "live" && a.status !== "live") return 1;
          return 0;
        });
        setMatches(sorted);
      } catch (e) {
        console.error(e);
      }
    };

    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const getDisplayTime = (match: Match) => {
    if (match.status === "finished") return "FT";
    if (match.status === "scheduled") return "vs";
    if (!match.startTime) return "0'";

    const diff = Math.floor((currentTime - match.startTime) / 60000);
    return diff > 90 ? "90+" : `${diff}'`;
  };

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Match Center</h1>
        <Link href="/admin">
          <Button variant="outline">Admin Panel</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Home</TableHead>
              <TableHead className="text-center w-[150px]">Score</TableHead>
              <TableHead>Away</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>
                  {match.status === "live" && (
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE {getDisplayTime(match)}
                    </Badge>
                  )}
                  {match.status === "finished" && (
                    <Badge variant="secondary">Finished</Badge>
                  )}
                  {match.status === "scheduled" && (
                    <Badge variant="outline">Upcoming</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {match.teamA}
                </TableCell>
                <TableCell className="text-center text-lg font-bold">
                  {match.status !== "scheduled"
                    ? `${match.scoreA} - ${match.scoreB}`
                    : "vs"}
                </TableCell>
                <TableCell className="font-medium">{match.teamB}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/match/${match.id}`}>
                    <Button size="sm">Details</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {matches.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No matches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
