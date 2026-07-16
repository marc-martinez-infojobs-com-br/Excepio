import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { UserResponseDto, ResetPasswordDto } from '@excepio/shared';

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: ResetPasswordDto }) => {
      const response = await apiClient.post<UserResponseDto>(
        `/users/${userId}/reset-password`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
