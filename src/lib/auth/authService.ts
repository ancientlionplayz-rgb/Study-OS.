import {
  UserAccountProfile,
  InviteCode,
  Team,
  TeamMember,
  TeamInvitation,
  PeerFriendship,
  InAppNotification,
  PublicStudentCard,
  AccountStatus,
} from './types';

const AUTH_STORAGE_KEY = 'studyos_auth_profile';
const INVITES_STORAGE_KEY = 'studyos_invite_codes';
const USERS_STORAGE_KEY = 'studyos_registered_users';
const TEAMS_STORAGE_KEY = 'studyos_teams_data';
const TEAM_INVITATIONS_STORAGE_KEY = 'studyos_team_invitations';
const FRIENDSHIPS_STORAGE_KEY = 'studyos_friendships';
const NOTIFICATIONS_STORAGE_KEY = 'studyos_notifications';

// Default Seed Users (Developer test personas & open community members)
const DEFAULT_USERS: UserAccountProfile[] = [
  {
    id: 'student_icse_9',
    username: 'rohan_icse',
    displayName: 'Rohan Sharma',
    email: 'rohan@studyos.local',
    role: 'student',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    onboardingCompleted: true,
  },
  {
    id: 'student_aarav',
    username: 'aarav_icse',
    displayName: 'Aarav Patel',
    email: 'aarav@studyos.local',
    role: 'student',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-09-02T00:00:00.000Z',
    onboardingCompleted: true,
  },
  {
    id: 'student_ananya',
    username: 'ananya_maths',
    displayName: 'Ananya Sen',
    email: 'ananya@studyos.local',
    role: 'student',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-09-03T00:00:00.000Z',
    onboardingCompleted: true,
  },
  {
    id: 'student_kabir',
    username: 'kabir_tech',
    displayName: 'Kabir Mehta',
    email: 'kabir@studyos.local',
    role: 'student',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-09-04T00:00:00.000Z',
    onboardingCompleted: true,
  },
  {
    id: 'admin_studyos_01',
    username: 'admin',
    displayName: 'StudyOS Admin',
    email: 'admin@studyos.local',
    role: 'admin',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    onboardingCompleted: true,
  },
];

const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team_icse_titans',
    name: 'ICSE Titans',
    emblem: '⚡',
    description: 'Disciplined academic recovery, morning maths consistency, and football stamina.',
    captainId: 'student_icse_9',
    captainName: 'Rohan Sharma',
    members: [
      {
        userId: 'student_icse_9',
        username: 'rohan_icse',
        displayName: 'Rohan Sharma',
        role: 'captain',
        joinedAt: '2026-09-01T00:00:00.000Z',
        weeklyContribution: 340,
      },
      {
        userId: 'student_aarav',
        username: 'aarav_icse',
        displayName: 'Aarav Patel',
        role: 'member',
        joinedAt: '2026-09-02T00:00:00.000Z',
        weeklyContribution: 290,
      },
    ],
    weeklyScore: 630,
    totalWins: 3,
    achievements: ['7-Day Maths Streak', 'Dragon Egg Contender'],
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'team_quantum_coders',
    name: 'Quantum Coders',
    emblem: '🚀',
    description: 'Python algorithms, AI agent building, and high-intensity STEM problem solving.',
    captainId: 'student_kabir',
    captainName: 'Kabir Mehta',
    members: [
      {
        userId: 'student_kabir',
        username: 'kabir_tech',
        displayName: 'Kabir Mehta',
        role: 'captain',
        joinedAt: '2026-09-04T00:00:00.000Z',
        weeklyContribution: 380,
      },
      {
        userId: 'student_ananya',
        username: 'ananya_maths',
        displayName: 'Ananya Sen',
        role: 'member',
        joinedAt: '2026-09-05T00:00:00.000Z',
        weeklyContribution: 310,
      },
    ],
    weeklyScore: 690,
    totalWins: 2,
    achievements: ['Dragon Egg Winner (Last Week)', 'Algorithm Sprint'],
    createdAt: '2026-09-02T00:00:00.000Z',
  },
];

const DEFAULT_INVITES: InviteCode[] = [
  {
    id: 'inv_welcome_open',
    code: 'STUDYOS2027',
    maxUses: 100,
    timesUsed: 4,
    expiresAt: null,
    createdBy: 'admin',
    status: 'active',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export class AuthService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- Registered Users (Open Community) ---
  public static getRegisteredUsers(): UserAccountProfile[] {
    if (!this.isBrowser()) return DEFAULT_USERS;
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return parsed;
    } catch {
      return DEFAULT_USERS;
    }
  }

  public static saveRegisteredUsers(users: UserAccountProfile[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }

  // --- Current Account / Session ---
  public static getCurrentAccount(): UserAccountProfile | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const stored: UserAccountProfile = JSON.parse(raw);
      const all = this.getRegisteredUsers();
      const match = all.find(
        (u) =>
          u.id === stored.id ||
          (u.email && stored.email && u.email.toLowerCase() === stored.email.toLowerCase())
      );
      if (match) {
        if (match.accountStatus !== stored.accountStatus || match.role !== stored.role) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(match));
          return match;
        }
      }
      return stored;
    } catch {
      return null;
    }
  }

  public static setCurrentAccount(acc: UserAccountProfile | null): void {
    if (!this.isBrowser()) return;
    if (acc) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(acc));
      const all = this.getRegisteredUsers();
      const idx = all.findIndex(
        (u) =>
          u.id === acc.id ||
          (u.email && acc.email && u.email.toLowerCase() === acc.email.toLowerCase())
      );
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...acc };
      } else {
        all.push(acc);
      }
      this.saveRegisteredUsers(all);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  public static updateAccountStatus(userId: string, newStatus: AccountStatus, approvedBy?: string): void {
    const all = this.getRegisteredUsers();
    const idx = all.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      all[idx].accountStatus = newStatus;
      if (newStatus === 'approved' || newStatus === 'active') {
        all[idx].approvedAt = new Date().toISOString();
        all[idx].approvedBy = approvedBy || 'admin';
      }
      this.saveRegisteredUsers(all);

      const current = this.getCurrentAccount();
      if (current && current.id === userId) {
        this.setCurrentAccount(all[idx]);
      }
    }
  }

  // --- Public Student Directory (Strict Privacy Filtering) ---
  public static getPublicStudents(currentUserId?: string): PublicStudentCard[] {
    const users = this.getRegisteredUsers().filter(
      (u) => u.accountStatus !== 'blocked' && u.accountStatus !== 'rejected' && u.role === 'student'
    );
    const teams = this.getTeams();
    const friendships = currentUserId ? this.getFriendships(currentUserId) : [];

    const metricsMap: Record<
      string,
      {
        weeklyConsistency: number;
        taskCompletionPercent: number;
        currentStreak: number;
        challengePoints: number;
        achievementsCount: number;
        grade: string;
        skillLabTrack?: string;
        skillLabHours?: number;
      }
    > = {
      student_icse_9: {
        weeklyConsistency: 95,
        taskCompletionPercent: 92,
        currentStreak: 5,
        challengePoints: 340,
        achievementsCount: 5,
        grade: 'Class 9 ICSE',
        skillLabTrack: 'Python & AI Agents',
        skillLabHours: 12,
      },
      student_aarav: {
        weeklyConsistency: 90,
        taskCompletionPercent: 88,
        currentStreak: 6,
        challengePoints: 290,
        achievementsCount: 4,
        grade: 'Class 9 ICSE',
        skillLabTrack: 'Football Analytics',
        skillLabHours: 8,
      },
      student_ananya: {
        weeklyConsistency: 96,
        taskCompletionPercent: 94,
        currentStreak: 7,
        challengePoints: 310,
        achievementsCount: 6,
        grade: 'Class 9 ICSE',
        skillLabTrack: 'Applied Mathematics',
        skillLabHours: 15,
      },
      student_kabir: {
        weeklyConsistency: 89,
        taskCompletionPercent: 86,
        currentStreak: 4,
        challengePoints: 380,
        achievementsCount: 5,
        grade: 'Class 9 ICSE',
        skillLabTrack: 'Robotics & Hardware',
        skillLabHours: 18,
      },
    };

    return users.map((u) => {
      const userTeam = teams.find((t) => t.members.some((m) => m.userId === u.id));
      const friendRec = friendships.find((f) => f.friendUserId === u.id);
      const m = metricsMap[u.id] || {
        weeklyConsistency: 85,
        taskCompletionPercent: 80,
        currentStreak: 2,
        challengePoints: 100,
        achievementsCount: 2,
        grade: 'Class 9 ICSE',
      };

      return {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        grade: m.grade,
        weeklyConsistency: m.weeklyConsistency,
        taskCompletionPercent: m.taskCompletionPercent,
        currentStreak: m.currentStreak,
        challengePoints: m.challengePoints,
        achievementsCount: m.achievementsCount,
        teamId: userTeam?.id,
        teamName: userTeam?.name,
        teamEmblem: userTeam?.emblem,
        skillLabTrack: m.skillLabTrack,
        skillLabHours: m.skillLabHours,
        isFriend: friendRec?.status === 'accepted',
        friendStatus: friendRec ? (friendRec.status === 'accepted' ? 'friends' : 'pending') : 'none',
      };
    });
  }

  // --- Teams Management ---
  public static getTeams(): Team[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (!raw) {
        const profRaw = localStorage.getItem('studyos_user_profile');
        const isDev = profRaw ? JSON.parse(profRaw).isDevTestMode : false;
        if (isDev) {
          localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(DEFAULT_TEAMS));
          return DEFAULT_TEAMS;
        }
        return [];
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static saveTeams(teams: Team[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    } catch (e) {
      console.error('Failed to save teams:', e);
    }
  }

  public static getTeamById(id: string): Team | undefined {
    return this.getTeams().find((t) => t.id === id);
  }

  public static createTeam(
    name: string,
    emblem: string,
    description: string,
    captain: UserAccountProfile,
    options?: {
      motto?: string;
      category?: 'Academic Excellence' | 'STEM & Coding' | 'Consistency & Habit' | 'Sports & Balance' | 'General';
      teamGoal?: string;
      weeklyTargetHours?: number;
      maxMembers?: number;
      joinType?: 'open' | 'request' | 'invite_only';
      privacy?: 'public' | 'registered_only';
      logoUrl?: string;
      tags?: string[];
    }
  ): Team {
    const teams = this.getTeams();
    const newTeam: Team = {
      id: 'team_' + Date.now(),
      name: name.trim(),
      emblem: emblem || '⚡',
      logoUrl: options?.logoUrl,
      motto: options?.motto?.trim(),
      description: description.trim(),
      category: options?.category || 'Academic Excellence',
      teamGoal: options?.teamGoal?.trim(),
      weeklyTargetHours: options?.weeklyTargetHours || 25,
      maxMembers: options?.maxMembers || 8,
      joinType: options?.joinType || 'open',
      privacy: options?.privacy || 'public',
      tags: options?.tags || ['ICSE', 'Discipline'],
      captainId: captain.id,
      captainName: captain.displayName,
      members: [
        {
          userId: captain.id,
          username: captain.username,
          displayName: captain.displayName,
          avatarUrl: captain.avatarUrl,
          role: 'captain',
          joinedAt: new Date().toISOString(),
          weeklyContribution: 0,
        },
      ],
      weeklyScore: 0,
      totalWins: 0,
      achievements: ['Newly Formed Squad'],
      createdAt: new Date().toISOString(),
    };
    teams.unshift(newTeam);
    this.saveTeams(teams);
    return newTeam;
  }

  public static leaveTeam(teamId: string, userId: string): boolean {
    const teams = this.getTeams();
    const teamIdx = teams.findIndex((t) => t.id === teamId);
    if (teamIdx === -1) return false;

    const team = teams[teamIdx];
    team.members = team.members.filter((m) => m.userId !== userId);

    if (team.captainId === userId && team.members.length > 0) {
      team.captainId = team.members[0].userId;
      team.captainName = team.members[0].displayName;
      team.members[0].role = 'captain';
    }

    if (team.members.length === 0) {
      teams.splice(teamIdx, 1);
    }

    this.saveTeams(teams);
    return true;
  }

  public static removeTeamMember(teamId: string, captainId: string, memberId: string): boolean {
    const teams = this.getTeams();
    const team = teams.find((t) => t.id === teamId);
    if (!team || team.captainId !== captainId) return false;

    team.members = team.members.filter((m) => m.userId !== memberId);
    this.saveTeams(teams);
    return true;
  }

  // --- Team Invitations ---
  public static getTeamInvitations(userId?: string): TeamInvitation[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(TEAM_INVITATIONS_STORAGE_KEY);
      const list: TeamInvitation[] = raw ? JSON.parse(raw) : [];
      if (!userId) return list;
      return list.filter((inv) => inv.invitedUserId === userId || inv.inviterId === userId);
    } catch {
      return [];
    }
  }

  public static saveTeamInvitations(invitations: TeamInvitation[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(TEAM_INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
    } catch (e) {
      console.error('Failed to save team invitations:', e);
    }
  }

  public static createTeamInvitation(
    teamId: string,
    inviter: UserAccountProfile,
    targetUser: { id: string; username: string }
  ): { success: boolean; message: string; invitation?: TeamInvitation } {
    const team = this.getTeamById(teamId);
    if (!team) return { success: false, message: 'Team not found.' };

    if (team.members.some((m) => m.userId === targetUser.id)) {
      return { success: false, message: `${targetUser.username} is already a member of this team.` };
    }

    const allInvs = this.getTeamInvitations();
    const duplicate = allInvs.find(
      (inv) => inv.teamId === teamId && inv.invitedUserId === targetUser.id && inv.status === 'pending'
    );
    if (duplicate) {
      return { success: false, message: 'An active invitation is already pending for this student.' };
    }

    const newInv: TeamInvitation = {
      id: 'tinv_' + Date.now(),
      teamId: team.id,
      teamName: team.name,
      teamEmblem: team.emblem,
      inviterId: inviter.id,
      inviterName: inviter.displayName,
      invitedUserId: targetUser.id,
      invitedUsername: targetUser.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    allInvs.unshift(newInv);
    this.saveTeamInvitations(allInvs);

    this.createNotification({
      userId: targetUser.id,
      type: 'team_invitation',
      title: `Team Invitation from ${team.name}`,
      message: `${inviter.displayName} invited you to join team ${team.name} ${team.emblem}.`,
      actionUrl: '/teams',
      metadata: { invitationId: newInv.id, teamId: team.id },
    });

    return { success: true, message: `Invitation sent to @${targetUser.username}!`, invitation: newInv };
  }

  public static respondToTeamInvitation(invitationId: string, accept: boolean, responder: UserAccountProfile): boolean {
    const allInvs = this.getTeamInvitations();
    const idx = allInvs.findIndex((inv) => inv.id === invitationId);
    if (idx === -1) return false;

    const inv = allInvs[idx];
    if (inv.invitedUserId !== responder.id) return false;

    inv.status = accept ? 'accepted' : 'declined';
    inv.respondedAt = new Date().toISOString();
    this.saveTeamInvitations(allInvs);

    if (accept) {
      const teams = this.getTeams();
      const team = teams.find((t) => t.id === inv.teamId);
      if (team && !team.members.some((m) => m.userId === responder.id)) {
        team.members.push({
          userId: responder.id,
          username: responder.username,
          displayName: responder.displayName,
          avatarUrl: responder.avatarUrl,
          role: 'member',
          joinedAt: new Date().toISOString(),
          weeklyContribution: 0,
        });
        this.saveTeams(teams);

        this.createNotification({
          userId: inv.inviterId,
          type: 'team_accepted',
          title: 'Invitation Accepted!',
          message: `${responder.displayName} accepted your invitation to join ${team.name}!`,
          actionUrl: '/teams',
        });
      }
    }
    return true;
  }

  public static cancelTeamInvitation(invitationId: string, userId: string): boolean {
    const allInvs = this.getTeamInvitations();
    const idx = allInvs.findIndex((inv) => inv.id === invitationId);
    if (idx === -1) return false;

    if (allInvs[idx].inviterId !== userId) return false;
    allInvs[idx].status = 'cancelled';
    this.saveTeamInvitations(allInvs);
    return true;
  }

  // --- Friend System ---
  public static getFriendships(userId: string): PeerFriendship[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
      const list: PeerFriendship[] = raw ? JSON.parse(raw) : [];
      return list.filter((f) => f.userId === userId);
    } catch {
      return [];
    }
  }

  public static saveFriendships(friendships: PeerFriendship[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(FRIENDSHIPS_STORAGE_KEY, JSON.stringify(friendships));
    } catch (e) {
      console.error('Failed to save friendships:', e);
    }
  }

  public static sendFriendRequest(
    user: UserAccountProfile,
    targetUsername: string
  ): { success: boolean; message: string; friendship?: PeerFriendship } {
    const clean = targetUsername.trim().toLowerCase().replace('@', '');
    if (!clean) return { success: false, message: 'Please enter a username.' };
    if (user.username.toLowerCase() === clean) {
      return { success: false, message: 'You cannot add yourself as a friend.' };
    }

    const allUsers = this.getRegisteredUsers();
    const target = allUsers.find((u) => u.username.toLowerCase() === clean);
    if (!target) {
      return { success: false, message: `Student @${clean} not found.` };
    }

    const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
    const list: PeerFriendship[] = raw ? JSON.parse(raw) : [];

    const existing = list.find((f) => f.userId === user.id && f.friendUserId === target.id);
    if (existing) {
      return { success: false, message: `Friendship or request with @${clean} already exists.` };
    }

    const outgoing: PeerFriendship = {
      id: 'fr_' + Date.now() + '_1',
      userId: user.id,
      friendUserId: target.id,
      friendUsername: target.username,
      friendDisplayName: target.displayName,
      status: 'pending',
      isIncoming: false,
      weeklyPoints: 120,
      consistencyScore: 85,
      currentStreak: 2,
      createdAt: new Date().toISOString(),
    };

    const incoming: PeerFriendship = {
      id: 'fr_' + Date.now() + '_2',
      userId: target.id,
      friendUserId: user.id,
      friendUsername: user.username,
      friendDisplayName: user.displayName,
      status: 'pending',
      isIncoming: true,
      weeklyPoints: 200,
      consistencyScore: 90,
      currentStreak: 3,
      createdAt: new Date().toISOString(),
    };

    list.unshift(outgoing, incoming);
    this.saveFriendships(list);

    this.createNotification({
      userId: target.id,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${user.displayName} (@${user.username}) sent you a friend request.`,
      actionUrl: '/friends',
      metadata: { fromUserId: user.id },
    });

    return { success: true, message: `Friend request sent to @${target.username}!`, friendship: outgoing };
  }

  public static respondToFriendRequest(userId: string, friendshipId: string, accept: boolean): boolean {
    const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
    const list: PeerFriendship[] = raw ? JSON.parse(raw) : [];

    const idx = list.findIndex((f) => f.id === friendshipId && f.userId === userId);
    if (idx === -1) return false;

    const item = list[idx];
    const counterpartIdx = list.findIndex(
      (f) => f.userId === item.friendUserId && f.friendUserId === userId
    );

    if (accept) {
      item.status = 'accepted';
      if (counterpartIdx !== -1) list[counterpartIdx].status = 'accepted';

      const current = this.getCurrentAccount();
      this.createNotification({
        userId: item.friendUserId,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `${current?.displayName || 'A student'} accepted your friend request!`,
        actionUrl: '/friends',
      });
    } else {
      list.splice(idx, 1);
      if (counterpartIdx !== -1) list.splice(counterpartIdx > idx ? counterpartIdx - 1 : counterpartIdx, 1);
    }

    this.saveFriendships(list);
    return true;
  }

  public static removeFriend(userId: string, friendshipId: string): boolean {
    const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
    const list: PeerFriendship[] = raw ? JSON.parse(raw) : [];

    const idx = list.findIndex((f) => f.id === friendshipId && f.userId === userId);
    if (idx === -1) return false;

    const item = list[idx];
    const counterpartIdx = list.findIndex(
      (f) => f.userId === item.friendUserId && f.friendUserId === userId
    );

    list.splice(idx, 1);
    if (counterpartIdx !== -1) list.splice(counterpartIdx > idx ? counterpartIdx - 1 : counterpartIdx, 1);

    this.saveFriendships(list);
    return true;
  }

  // --- In-App Notifications ---
  public static getNotifications(userId: string): InAppNotification[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const list: InAppNotification[] = raw ? JSON.parse(raw) : [];
      return list.filter((n) => n.userId === userId);
    } catch {
      return [];
    }
  }

  public static createNotification(
    data: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>
  ): InAppNotification {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) : null;
    const list: InAppNotification[] = raw ? JSON.parse(raw) : [];

    const newNotif: InAppNotification = {
      ...data,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      read: false,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newNotif);
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    }
    return newNotif;
  }

  public static markNotificationAsRead(id: string): void {
    if (!this.isBrowser()) return;
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const list: InAppNotification[] = raw ? JSON.parse(raw) : [];
      const item = list.find((n) => n.id === id);
      if (item) {
        item.read = true;
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  }

  public static markAllNotificationsAsRead(userId: string): void {
    if (!this.isBrowser()) return;
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const list: InAppNotification[] = raw ? JSON.parse(raw) : [];
      list.forEach((n) => {
        if (n.userId === userId) n.read = true;
      });
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  }

  // --- Optional Legacy Invite Codes (Non-gating, optional promo/school bonus) ---
  public static getInviteCodes(): InviteCode[] {
    if (!this.isBrowser()) return DEFAULT_INVITES;
    try {
      const raw = localStorage.getItem(INVITES_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(DEFAULT_INVITES));
        return DEFAULT_INVITES;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_INVITES;
    }
  }

  public static saveInviteCodes(codes: InviteCode[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(codes));
    } catch (e) {
      console.error('Failed to save invite codes:', e);
    }
  }

  public static validateInviteCode(rawCode: string): { valid: boolean; message?: string } {
    const clean = rawCode.trim().toUpperCase();
    if (!clean) return { valid: true }; // Optional!
    const list = this.getInviteCodes();
    const found = list.find((c) => c.code.toUpperCase() === clean);
    if (!found) return { valid: false, message: 'Invalid invite code.' };
    if (found.status !== 'active') return { valid: false, message: 'This invite code is no longer active.' };
    if (found.timesUsed >= found.maxUses) return { valid: false, message: 'This invite code has reached maximum uses.' };
    return { valid: true };
  }

  public static consumeInviteCode(rawCode: string): boolean {
    const clean = rawCode.trim().toUpperCase();
    if (!clean) return false;
    const list = this.getInviteCodes();
    const idx = list.findIndex((c) => c.code.toUpperCase() === clean);
    if (idx === -1) return false;
    list[idx].timesUsed += 1;
    this.saveInviteCodes(list);
    return true;
  }

  public static createInviteCode(
    code: string,
    maxUses = 5,
    expiresAt: string | null = null,
    createdBy = 'admin'
  ): InviteCode {
    const list = this.getInviteCodes();
    const newCode: InviteCode = {
      id: 'inv_' + Date.now(),
      code: code.trim().toUpperCase(),
      maxUses,
      timesUsed: 0,
      expiresAt,
      createdBy,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newCode);
    this.saveInviteCodes(list);
    return newCode;
  }

  public static revokeInviteCode(id: string): void {
    const list = this.getInviteCodes();
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      list[idx].status = 'revoked';
      this.saveInviteCodes(list);
    }
  }
}
