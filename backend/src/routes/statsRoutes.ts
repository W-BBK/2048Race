import { Router } from "express";
import { getLeaderboard, getPlayerStats } from "../db/statsRepo.js";

export const statsRouter = Router();

statsRouter.get("/leaderboard", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  res.json({ leaderboard: getLeaderboard(limit) });
});

statsRouter.get("/stats/:playerId", (req, res) => {
  const stats = getPlayerStats(req.params.playerId);
  if (!stats) {
    res.json({
      playerId: req.params.playerId,
      username: null,
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
      winRate: 0,
      fastestWinMs: null,
    });
    return;
  }
  res.json(stats);
});
