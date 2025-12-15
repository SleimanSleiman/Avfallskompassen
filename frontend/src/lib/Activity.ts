import { api } from "./api";
import { currentUser } from "./Auth";

export type Activity = {
    details : String,
    timeStamp : String
}

function getAuthHeaders(): Record<string, string> | undefined {
    const user = currentUser();
    return user?.username ? { 'X-Username': user.username } : undefined;
}

export async function getUsersLatestActivities(limit: number = 20): Promise<Activity[]> {
  return await api<Activity[]>(`/api/user/activities?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}
