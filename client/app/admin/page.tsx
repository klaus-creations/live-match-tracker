"use client";

import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Match } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Play,
  Square,
  Flag,
  AlertTriangle,
  Volleyball,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [newTeamA, setNewTeamA] = useState("");
  const [newTeamB, setNewTeamB] = useState("");
  const [eventPlayer, setEventPlayer] = useState("");
  const [eventTeam, setEventTeam] = useState<"A" | "B">("A");

  const fetchMatches = useCallback(async () => {
    try {
      const res = await api.get("/api/matches");
      setMatches(res.data);

      if (selectedMatch) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = res.data.find((m: any) => m.id === selectedMatch.id);
        if (updated) {
          setSelectedMatch(updated);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch matches");
    }
  }, [selectedMatch]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchMatches();
    };

    fetchData();

    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [fetchMatches, selectedMatch?.id]);

  const createMatch = async () => {
    if (!newTeamA || !newTeamB) {
      toast.error("Please enter both team names");
      return;
    }

    try {
      await api.post("/api/admin/match", { teamA: newTeamA, teamB: newTeamB });
      setNewTeamA("");
      setNewTeamB("");
      toast.success("Match created successfully");
      fetchMatches();
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error(
        "Failed to create match. Please check the console for details."
      );
    }
  };

  const updateStatus = async (status: "start" | "end") => {
    if (!selectedMatch) return;

    try {
      await api.post(`/api/admin/match/${selectedMatch.id}/${status}`);
      const action = status === "start" ? "started" : "ended";
      toast.success(`Match ${action} successfully`);
      fetchMatches();
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${status} match`);
    }
  };

  const sendEvent = async (type: string, playerRequired: boolean = false) => {
    if (!selectedMatch) return;
    if (playerRequired && !eventPlayer.trim()) {
      toast.error("Please enter player name");
      return;
    }

    try {
      await api.post(`/api/admin/match/${selectedMatch.id}/event`, {
        type,
        team: eventTeam,
        player: playerRequired ? eventPlayer.trim() : undefined,
      });

      // Show appropriate toast based on event type
      const teamName =
        eventTeam === "A" ? selectedMatch.teamA : selectedMatch.teamB;
      const eventMessages: { [key: string]: string } = {
        goal: `⚽ Goal! ${eventPlayer} (${teamName})`,
        card_yellow: `🟨 Yellow card for ${eventPlayer} (${teamName})`,
        card_red: `🟥 Red card for ${eventPlayer} (${teamName})`,
        corner: `🎯 Corner kick for ${teamName}`,
        foul: `⚠️ Foul by ${teamName}`,
      };

      toast.success(eventMessages[type] || "Event recorded");

      setEventPlayer("");
      fetchMatches();
    } catch (error) {
      console.log(error);
      toast.error("Failed to record event");
    }
  };

  if (!selectedMatch) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Match Administration
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor live matches
            </p>
          </div>
        </div>

        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              Create New Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamA">Home Team</Label>
                  <Input
                    id="teamA"
                    placeholder="Enter home team name"
                    value={newTeamA}
                    onChange={(e) => setNewTeamA(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamB">Away Team</Label>
                  <Input
                    id="teamB"
                    placeholder="Enter away team name"
                    value={newTeamB}
                    onChange={(e) => setNewTeamB(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={createMatch} className="sm:self-end">
                <Plus className="mr-2 h-4 w-4" /> Create Match
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2"
              onClick={() => setSelectedMatch(match)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold truncate">
                    {match.teamA} vs {match.teamB}
                  </CardTitle>
                  {match.status === "live" ? (
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="capitalize">
                      {match.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {match.scoreA} - {match.scoreB}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {match.status === "scheduled"
                      ? "Not started"
                      : match.status === "finished"
                      ? "Completed"
                      : "In progress"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {matches.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Volleyball className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No matches found
              </h3>
              <p className="text-gray-600">
                Create your first match to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Selected Match Control View
  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => setSelectedMatch(null)}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Matches
      </Button>

      {/* Match Header */}
      <Card className="mb-8 bg-linear-to-r from-gray-700 to-gray-600 text-white border-0">
        <CardContent className="pt-8 pb-6">
          <div className="text-center mb-2">
            <Badge variant="secondary" className="mb-4 text-sm">
              {selectedMatch.status === "live"
                ? "LIVE MATCH"
                : selectedMatch.status === "finished"
                ? "FULL TIME"
                : "SCHEDULED"}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-2xl font-bold mb-8">
            <div className="text-center flex-1">
              <div className="text-lg mb-2">{selectedMatch.teamA}</div>
              <div className="text-3xl text-blue-300">
                {selectedMatch.scoreA}
              </div>
            </div>

            <div className="mx-8 text-center">
              <div className="text-sm text-gray-300 mb-1">VS</div>
              <div className="text-5xl font-mono font-bold">
                {selectedMatch.scoreA} : {selectedMatch.scoreB}
              </div>
              <div className="text-xs text-gray-400 mt-1">SCORE</div>
            </div>

            <div className="text-center flex-1">
              <div className="text-lg mb-2">{selectedMatch.teamB}</div>
              <div className="text-3xl text-blue-300">
                {selectedMatch.scoreB}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {selectedMatch.status === "scheduled" && (
              <Button
                onClick={() => updateStatus("start")}
                className="bg-green-600 hover:bg-green-700 px-6"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" /> Start Match
              </Button>
            )}
            {selectedMatch.status === "live" && (
              <Button
                onClick={() => updateStatus("end")}
                variant="destructive"
                className="px-6"
                size="lg"
              >
                <Square className="mr-2 h-4 w-4" /> End Match
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMatch.status === "live" && (
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Volleyball className="h-4 w-4" />
              Quick Events
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Match Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team A Controls */}
              <Card>
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="text-center text-blue-900">
                    {selectedMatch.teamA}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
                        ⚽ Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Goal for {selectedMatch.teamA}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-3">
                        <Label>Scorer Name</Label>
                        <Input
                          value={eventPlayer}
                          onChange={(e) => setEventPlayer(e.target.value)}
                          placeholder="Enter scorer name"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            setEventTeam("A");
                            sendEvent("goal", true);
                          }}
                        >
                          Confirm Goal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-2 gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 h-12"
                        >
                          🟨 Yellow
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Yellow Card: {selectedMatch.teamA}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                          <Label>Player Name</Label>
                          <Input
                            value={eventPlayer}
                            onChange={(e) => setEventPlayer(e.target.value)}
                            placeholder="Enter player name"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setEventTeam("A");
                              sendEvent("card_yellow", true);
                            }}
                          >
                            Confirm Card
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-red-400 text-red-700 hover:bg-red-50 h-12"
                        >
                          🟥 Red
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Red Card: {selectedMatch.teamA}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                          <Label>Player Name</Label>
                          <Input
                            value={eventPlayer}
                            onChange={(e) => setEventPlayer(e.target.value)}
                            placeholder="Enter player name"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setEventTeam("A");
                              sendEvent("card_red", true);
                            }}
                          >
                            Confirm Card
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Team B Controls */}
              <Card>
                <CardHeader className="bg-red-50 border-b">
                  <CardTitle className="text-center text-red-900">
                    {selectedMatch.teamB}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
                        ⚽ Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Goal for {selectedMatch.teamB}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-3">
                        <Label>Scorer Name</Label>
                        <Input
                          value={eventPlayer}
                          onChange={(e) => setEventPlayer(e.target.value)}
                          placeholder="Enter scorer name"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            setEventTeam("B");
                            sendEvent("goal", true);
                          }}
                        >
                          Confirm Goal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-2 gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 h-12"
                        >
                          🟨 Yellow
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Yellow Card: {selectedMatch.teamB}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                          <Label>Player Name</Label>
                          <Input
                            value={eventPlayer}
                            onChange={(e) => setEventPlayer(e.target.value)}
                            placeholder="Enter player name"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setEventTeam("B");
                              sendEvent("card_yellow", true);
                            }}
                          >
                            Confirm Card
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-red-400 text-red-700 hover:bg-red-50 h-12"
                        >
                          🟥 Red
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Red Card: {selectedMatch.teamB}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                          <Label>Player Name</Label>
                          <Input
                            value={eventPlayer}
                            onChange={(e) => setEventPlayer(e.target.value)}
                            placeholder="Enter player name"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setEventTeam("B");
                              sendEvent("card_red", true);
                            }}
                          >
                            Confirm Card
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* General Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Match Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="h-12">
                        <Flag className="mr-2 h-4 w-4" />
                        Corner Kick
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Corner Kick</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-3">
                        <Label>Select Team</Label>
                        <Select
                          onValueChange={(v: "A" | "B") => setEventTeam(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">
                              {selectedMatch.teamA}
                            </SelectItem>
                            <SelectItem value="B">
                              {selectedMatch.teamB}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => sendEvent("corner")}>
                          Confirm Corner
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="h-12">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Foul
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Foul Committed</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-3">
                        <Label>Which Team Committed?</Label>
                        <Select
                          onValueChange={(v: "A" | "B") => setEventTeam(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">
                              {selectedMatch.teamA}
                            </SelectItem>
                            <SelectItem value="B">
                              {selectedMatch.teamB}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => sendEvent("foul")}>
                          Confirm Foul
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Match Events Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto border rounded-lg bg-gray-50 p-4 space-y-3">
                  {[...selectedMatch.logs].reverse().map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-sm border-b pb-3 last:border-b-0"
                    >
                      <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded min-w-12 text-center">
                        {log.time}
                      </span>
                      <span className="flex-1">{log.description}</span>
                    </div>
                  ))}

                  {selectedMatch.logs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No events recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
// Selected Match Control View
