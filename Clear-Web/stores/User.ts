import { ref } from 'vue'

export const useUserStore = defineStore('userStore', () => {
    const username = ref<string | null>(null)
    const numOfDone = ref<number>(0)
    const numOfUndone = ref<number>(0)

    const setUsername = (newUsername: string) => {
        username.value = newUsername
    }

    const setNumOfDone = (newNumOfDone: number) => {
        numOfDone.value = newNumOfDone
    }

    const setNumOfUndone = (newNumOfUndone: number) => {
        numOfUndone.value = newNumOfUndone
    }

    return { username, numOfDone, numOfUndone, setUsername, setNumOfDone, setNumOfUndone }
})