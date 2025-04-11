import mongoose from "mongoose";

export type Submission = {
  icon: string;
  name: string;
  user: string;
  guild: string;
  accepted: boolean;
  winner: boolean;
  archived: boolean;
  message_id?: string;
  created_at: Date;
};

export type PartialSubmission = {
  icon?: string;
  name?: string;
  user?: string;
  guild?: string;
  accepted?: boolean;
  winner?: boolean;
  archived?: boolean;
  message_id?: string;
  created_at?: Date;
};

export type PartialSubmissionNullable = {
  icon?: string | null;
  name?: string | null;
  user?: string | null;
  guild?: string | null;
  accepted?: boolean | null;
  winner?: boolean | null;
  archived?: boolean | null;
  message_id?: string | null;
  created_at?: Date | null;
};

export type Settings = {
  guild: string;
  // General
  admin_channel: string;
  announce_channel: string;
  embed_fixer: boolean;
  timeout_nyaboom: boolean;
  // Voting
  voting_enabled: boolean;
  voting_channel: string;
  max_suggestions: number;
  name_template: string;
  // Events
  event_channel: string;
};

export type PartialSettings = {
  guild?: string;
  // General
  admin_channel?: string;
  announce_channel?: string;
  embed_fixer?: boolean;
  timeout_nyaboom?: boolean;
  // Voting
  voting_enabled?: boolean;
  voting_channel?: string;
  max_suggestions?: number;
  name_template?: string;
  // Events
  event_channel?: string;
};

export type PartialSettingsNullable = {
  guild?: string | null;
  // General
  admin_channel?: string | null;
  announce_channel?: string | null;
  embed_fixer?: boolean | null;
  timeout_nyaboom?: boolean | null;
  // Voting
  voting_enabled?: boolean | null;
  voting_channel?: string | null;
  max_suggestions?: number | null;
  name_template?: string | null;
  // Events
  event_channel?: string | null;
};

const defaultGuild = {
  // General
  admin_channel: "",
  announce_channel: "",
  embed_fixer: false,
  timeout_nyaboom: false,
  // Voting
  voting_enabled: false,
  voting_channel: "",
  name_template: "{name}",
  max_suggestions: 5,
  // Events
  event_channel: "",
};

export type Event = {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  guild: string;
  channel: string;
  participants: string[];
  message_id: string;
};

export type PartialEvent = {
  name?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  guild?: string;
  channel?: string;
  participants?: string[];
  message_id?: string;
};

export type Guild = {
  id: string;
  name: string;
  icon: string;
  owner: string;
  members: number;
  channels: number;
  roles: number;
  created_at: Date;
};

export type PartialGuild = {
  id?: string;
  name?: string;
  icon?: string;
  owner?: string;
  members?: number;
  channels?: number;
  roles?: number;
  created_at?: Date;
};

export type PartialGuildNullable = {
  id?: string | null;
  name?: string | null;
  icon?: string | null;
  owner?: string | null;
  members?: number | null;
  channels?: number | null;
  roles?: number | null;
  created_at?: Date | null;
};

export type User = {
  id: string;
  settings: {
    timezone: string;
    birthday: Date;
  };
  credits: number;
};

export type PartialUser = {
  id?: string;
  settings?: {
    timezone?: string;
    birthday?: Date;
  };
  credits?: number;
};

export type PartialUserNullable = {
  id?: string | null;
  settings?: {
    timezone?: string | null;
    birthday?: Date | null;
  };
  credits?: number | null;
};

// Don't judge the partials. It works.

class AsukaDatabase {
  private Submission = mongoose.model(
    "Submission",
    new mongoose.Schema({
      id: String,
      icon: String,
      name: String,
      user: String,
      guild: String,
      accepted: Boolean,
      winner: Boolean,
      archived: Boolean,
      message_id: String,
      created_at: Date,
    }),
  );

  private Settings = mongoose.model(
    "Settings",
    new mongoose.Schema({
      guild: String,
      // General
      admin_channel: String,
      announce_channel: String,
      // Voting
      voting_enabled: Boolean,
      voting_channel: String,
      max_suggestions: Number,
      name_template: String,
      // Events
      event_channel: String,
      // Misc
      embed_fixer: Boolean,
      timeout_nyaboom: Boolean,
    }),
  );

  private Event = mongoose.model(
    "Event",
    new mongoose.Schema({
      name: String,
      description: String,
      start_date: Date,
      end_date: Date,
      guild: String,
      channel: String,
      participants: [String],
      message_id: String,
    }),
  );

  private Guild = mongoose.model(
    "Guild",
    new mongoose.Schema({
      id: String,
      name: String,
      icon: String,
      owner: String,
      members: Number,
      channels: Number,
      roles: Number,
      created_at: Date,
    }),
  );

  private User = mongoose.model(
    "User",
    new mongoose.Schema({
      id: String,
      settings: {
        timezone: String,
        birthday: Date,
      },
      credits: Number,
    }),
  );

  // A cache for settings to reduce database queries
  private settingsCache: Map<
    // Guild ID
    string,
    // Settings
    { date: Date; settings: PartialSettingsNullable }
  > = new Map();

  public async connect() {
    const uri = Bun.env.MONGODB_URI;
    if (!uri) {
      throw new Error("No MongoDB URI provided.");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
  }

  private get connected() {
    return mongoose.connection.readyState === 1;
  }

  public async disconnect() {
    await mongoose.disconnect();
  }

  public async createSubmission(
    id: string,
    icon: string,
    name: string,
    user: string,
    guild: string,
  ) {
    const submission = new this.Submission({
      id,
      icon,
      name,
      user,
      guild,
      accepted: false,
      winner: false,
      message_id: undefined,
      created_at: new Date(),
    });

    await submission.save();
  }

  public getSubmissions(guild?: string) {
    if (!this.connected) {
      this.connect();
    }

    if (!guild) {
      return this.Submission.find();
    }
    return this.Submission.find({ guild });
  }

  public getThisWeeksSubmissions(guild: string) {
    if (!this.connected) {
      this.connect();
    }

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return this.Submission.find({
      guild,
      created_at: { $gte: startOfWeek },
    });
  }

  public async getSubmissionFromMessage(message_id: string) {
    if (!this.connected) {
      this.connect();
    }

    return await this.Submission.findOne({ message_id });
  }

  public async getSubmissionFromId(id: string) {
    if (!this.connected) {
      this.connect();
    }

    return await this.Submission.findOne({ id: id });
  }

  public async getSubmissionsFromUser(user: string, thisWeek = false) {
    if (!this.connected) {
      this.connect();
    }

    if (thisWeek) {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      return await this.Submission.find({
        user,
        created_at: { $gte: startOfWeek },
      });
    }

    return await this.Submission.find({ user });
  }

  public async updateSubmission(id: string, data: PartialSubmission) {
    if (!this.connected) {
      this.connect();
    }

    await this.Submission.findOneAndUpdate({ id }, { ...data });
  }

  public async getSettings(guild: string) {
    if (!this.connected) {
      this.connect();
    }

    const cached = this.settingsCache.get(guild);

    if (cached) {
      const cached = this.settingsCache.get(guild);
      const timeNeeded = 1000 * 60; // 1 minute
      if (cached && cached.date.getTime() + timeNeeded > Date.now()) {
        return cached.settings;
      }
      this.settingsCache.delete(guild);
    }

    const settings = await this.Settings.findOne({
      guild,
    });

    if (settings) {
      this.settingsCache.set(guild, {
        date: new Date(),
        settings: {
          guild: settings.guild,
          // General
          admin_channel: settings.admin_channel,
          announce_channel: settings.announce_channel,
          embed_fixer: settings.embed_fixer,
          timeout_nyaboom: settings.timeout_nyaboom,
          // Voting
          voting_enabled: settings.voting_enabled,
          voting_channel: settings.voting_channel,
          max_suggestions: settings.max_suggestions,
          name_template: settings.name_template,
          // Events
          event_channel: settings.event_channel,
        },
      });

      return settings;
    }
    return null;
  }

  public async createSettings(guild: string) {
    if (!this.connected) {
      this.connect();
    }

    const settings = new this.Settings({ ...defaultGuild, guild });

    await settings.save();
  }

  public async updateSettings(guild: string, data: PartialSettings) {
    if (!this.connected) {
      this.connect();
    }

    this.settingsCache.delete(guild);

    await this.Settings.findOneAndUpdate({ guild }, { ...data });
  }

  public async resetSettings(guild: string) {
    if (!this.connected) {
      this.connect();
    }

    this.settingsCache.delete(guild);

    const _def = { ...defaultGuild, guild };
    await this.Settings.findOneAndUpdate({ guild }, _def);
  }

  public async deleteSettings(guild: string) {
    if (!this.connected) {
      this.connect();
    }

    await this.Settings.findOneAndDelete({ guild });
  }

  public async deleteSubmission(id: string) {
    if (!this.connected) {
      this.connect();
    }

    await this.Submission.findOneAndDelete({ id });
  }

  public async createUser(id: string) {
    if (!this.connected) {
      this.connect();
    }

    const user = new this.User({
      id,
      settings: {
        timezone: "UTC",
        birthday: new Date(0),
      },
      credits: 0,
    });

    await user.save();
  }

  public async getUser(id: string) {
    if (!this.connected) {
      this.connect();
    }

    // If there is no user, create one
    if (
      !(await this.User.findOne({
        id,
      }))
    ) {
      await this.createUser(id);
    }

    return this.User.findOne({
      id,
    });
  }

  public async updateUser(id: string, data: PartialUser): Promise<void> {
    if (!this.connected) {
      this.connect();
    }

    // If there is no user, create one
    if (
      !(await this.User.findOne({
        id,
      }))
    ) {
      await this.createUser(id);
    }

    await this.User.findOneAndUpdate({ id }, { ...data });
  }

  public async deleteUser(id: string): Promise<void> {
    if (!this.connected) {
      this.connect();
    }

    await this.User.findOneAndDelete({ id });
  }

  public async addUserCredits(id: string, amount: number): Promise<void> {
    if (!this.connected) {
      this.connect();
    }

    // If there is no user, create one
    if (
      !(await this.User.findOne({
        id,
      }))
    ) {
      await this.createUser(id);
    }

    await this.User.findOneAndUpdate({ id }, { $inc: { credits: amount } });
  }

  public async createEvent(
    guild: string,
    name: string,
    description: string,
    start_date: Date,
    end_date?: Date,
    channel = "",
    message_id = "",
    participants: string[] = [],
  ) {
    if (!this.connected) {
      this.connect();
    }

    const event = new this.Event({
      name,
      description,
      start_date,
      end_date,
      guild,
      channel,
      participants,
      message_id,
    });

    await event.save();
  }

  public getEvents(guild: string) {
    if (!this.connected) {
      this.connect();
    }

    return this.Event.find({ guild });
  }

  public getFutureEvents(guild: string) {
    if (!this.connected) {
      this.connect();
    }

    return this.Event.find({ guild, start_date: { $gte: new Date() } });
  }

  public getEventFromMessage(message_id: string) {
    if (!this.connected) {
      this.connect();
    }

    return this.Event.findOne({ message_id });
  }

  public getEventFromId(id: string) {
    if (!this.connected) {
      this.connect();
    }

    return this.Event.findById(id);
  }

  public async updateEvent(id: string, data: PartialEvent) {
    if (!this.connected) {
      this.connect();
    }

    await this.Event.findByIdAndUpdate(id, data);
  }

  public async deleteEvent(id: string) {
    if (!this.connected) {
      this.connect();
    }

    await this.Event.findByIdAndDelete(id);
  }

  public async createGuild(
    id: string,
    name: string,
    icon: string,
    owner: string,
    members: number,
    channels: number,
    roles: number,
    created_at: Date,
  ) {
    if (!this.connected) {
      this.connect();
    }

    const guild = new this.Guild({
      id,
      name,
      icon,
      owner,
      members,
      channels,
      roles,
      created_at,
    });

    await guild.save();
  }

  public getGuild(id: string) {
    if (!this.connected) {
      this.connect();
    }

    return this.Guild.findOne({ id });
  }

  public async updateGuild(id: string, data: PartialGuild) {
    if (!this.connected) {
      this.connect();
    }

    await this.Guild.findOneAndUpdate({ id }, data);
  }
}

export default new AsukaDatabase();
