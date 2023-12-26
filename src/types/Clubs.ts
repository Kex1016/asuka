import { Server, User } from "./Server";

export type Club = {
  id: number;
  name: string;
  description: string;
  channel: string;
  topics: string;
  isPending: boolean;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date;
  server: Server;
  owner: User;
  members: User[];
};
