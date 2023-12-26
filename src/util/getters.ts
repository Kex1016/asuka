import {PrismaClient} from "@prisma/client";

export async function getServerChannels(server: string, prisma: PrismaClient) {
  const channels = await prisma.server.findUnique({
    where: {
      id: parseInt(server),
    },
    select: {
      clubAnnouncementChannel: true,
      clubListChannel: true,
    }
  });

  if (!channels) {
    return null;
  }

  return channels;
}