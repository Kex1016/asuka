import { Club } from "./Clubs";

export type Server = {
  id: number;
  name: string;
  clubs: Club[];
  users: User[];
  clubAnnouncementChannel: string;
  clubListChannel: string;
  minimumVotesToPass: number;
  minimumVotesToFail: number;
  minimumVotesToBlacklist: number;
};

export type User = {
  id: number;
  Club?: Club; // The user's own club!
  server: Server;
};
