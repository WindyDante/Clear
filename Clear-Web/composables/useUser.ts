import { getRequest } from "~/utils/api";

export const useUser = () => {
    const user = useUserStore();

    // 获取用户信息
    const getUserStatus = async () => {
        try {
            const response = await getRequest<any>('user/status');
            if (!response) {
                throw new Error('Get user status request failed');
            }

            const { username, numOfDone, numOfUndone } = response.data;
            user.setUsername(username);
            user.setNumOfDone(numOfDone);
            user.setNumOfUndone(numOfUndone);
        } catch (error) {
            console.error(error);
        }
    }

    return { getUserStatus }
}