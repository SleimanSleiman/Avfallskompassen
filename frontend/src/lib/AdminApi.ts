import { put } from "./Api";

export type UpdateUserRoleResponse = {
  id: number;
  username: string;
  role: string;
};

export async function updateUserRole(
  userId: number,
  role: "USER" | "ADMIN"
): Promise<UpdateUserRoleResponse> {
  return put<UpdateUserRoleResponse>(
    `/api/admin/users/${userId}/role?role=${role}`
  );
}
