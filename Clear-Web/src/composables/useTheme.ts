import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
// IMPORTANT: Ensure you have services/api.ts with an updateUserTheme function
import api from '../services/api';
import { useToast } from './useToast';

// Define Theme interface based on usage in AboutView.vue and your CSS variables
interface Theme {
    name: string;
    colors: Record<string, string>; // e.g., { '--primary-color': '#value', '--background-color': '#value', ... }
}

// Singleton state for themes
// Populate this array with your actual theme definitions.
// Ensure 'colors' contains all CSS variables your application uses for theming.
// The names should match those used in AboutView.vue's getThemePreviewColor.
const actualThemes = ref<Theme[]>(
    [
        {
            name: '天青',
            colors: {
                '--primary-color': '#3498db',
                '--primary-light': '#5dade2',
                '--primary-dark': '#ffffff', // 添加 primary-dark 并设置为白色
                '--primary-rgb': '52, 152, 219',
                '--secondary-color': '#2ecc71',
                '--background-color': '#f5f7fa',
                '--card-color': '#ffffff',
                '--text-color': '#3c4858',
                '--text-secondary': '#8492a6',
                '--text-on-primary': '#ffffff',
                '--border-color': '#e0e6ed',
                '--success-color': '#67c23a',
                '--danger-color': '#f56c6c',
                '--warning-color': '#e6a23c',
                '--info-color': '#909399',
                '--datepicker-bg': '#ffffff',
                '--datepicker-text-color': '#3c4858',
                '--datepicker-hover-bg': '#ecf5ff',
                '--datepicker-active-text-color': '#ffffff',
            },
        },
        {
            name: '墨玉', // 原"玄青"，更改为符合黑色调的名称
            colors: {
                '--primary-color': '#409eff',
                '--primary-light': '#66b1ff',
                '--primary-dark': '#ffffff', // 添加 primary-dark 并设置为白色
                '--primary-rgb': '64, 158, 255',
                '--secondary-color': '#85ce61',
                '--background-color': '#1d1e20',
                '--card-color': '#2c2f33',
                '--text-color': '#dcdfe6',
                '--text-secondary': '#a0a5ac',
                '--text-on-primary': '#ffffff',
                '--border-color': '#41454a',
                '--success-color': '#67c23a',
                '--danger-color': '#f56c6c',
                '--warning-color': '#e6a23c',
                '--info-color': '#909399',
                '--datepicker-bg': '#26282b',
                '--datepicker-text-color': '#dcdfe6',
                '--datepicker-hover-bg': '#383b3e',
                '--datepicker-active-text-color': '#ffffff',
            },
        },
        {
            name: '胭脂',
            colors: {
                '--primary-color': '#c74c3c', // 胭脂红
                '--primary-light': '#e74c3c',
                '--primary-dark': '#ffffff', // 添加 primary-dark 并设置为白色
                '--primary-rgb': '199, 76, 60',
                '--secondary-color': '#d35400',
                '--background-color': '#fdf6f5',
                '--card-color': '#ffffff',
                '--text-color': '#5a2a27',
                '--text-secondary': '#a1665e',
                '--text-on-primary': '#ffffff',
                '--border-color': '#f8e9e7',
                '--success-color': '#27ae60',
                '--danger-color': '#c0392b',
                '--warning-color': '#f39c12',
                '--info-color': '#c74c3c',
                '--datepicker-bg': '#fffafa',
                '--datepicker-text-color': '#5a2a27',
                '--datepicker-hover-bg': '#f8e9e7',
                '--datepicker-active-text-color': '#ffffff',
            },
        },
        {
            name: '藤黄',
            colors: {
                '--primary-color': '#f39c12', // 藤黄色
                '--primary-light': '#f1c40f',
                '--primary-dark': '#ffffff', // 添加 primary-dark 并设置为白色
                '--primary-rgb': '243, 156, 18',
                '--secondary-color': '#e67e22',
                '--background-color': '#fffcf5',
                '--card-color': '#ffffff',
                '--text-color': '#79550a',
                '--text-secondary': '#b18933',
                '--text-on-primary': '#ffffff',
                '--border-color': '#faebcc',
                '--success-color': '#27ae60',
                '--danger-color': '#c0392b',
                '--warning-color': '#f39c12',
                '--info-color': '#f39c12',
                '--datepicker-bg': '#fffef9',
                '--datepicker-text-color': '#79550a',
                '--datepicker-hover-bg': '#faebcc',
                '--datepicker-active-text-color': '#ffffff',
            },
        },
        {
            name: '紫棠',
            colors: {
                '--primary-color': '#8e44ad', // 紫棠色
                '--primary-light': '#9b59b6',
                '--primary-dark': '#ffffff', // 添加 primary-dark 并设置为白色
                '--primary-rgb': '142, 68, 173',
                '--secondary-color': '#c39bd3',
                '--background-color': '#fbf5ff',
                '--card-color': '#ffffff',
                '--text-color': '#4a148c',
                '--text-secondary': '#884ea0',
                '--text-on-primary': '#ffffff',
                '--border-color': '#f2e7fe',
                '--success-color': '#27ae60',
                '--danger-color': '#c0392b',
                '--warning-color': '#f39c12',
                '--info-color': '#8e44ad',
                '--datepicker-bg': '#fdfaff',
                '--datepicker-text-color': '#4a148c',
                '--datepicker-hover-bg': '#f2e7fe',
                '--datepicker-active-text-color': '#ffffff',
            },
        },
        {
            name: '青碧',
            colors: {
                '--primary-color': '#1abc9c', // 青碧色
                '--primary-light': '#48c9b0',
                '--primary-dark': '#ffffff', // 添加 primary-dark 并设置为白色
                '--primary-rgb': '26, 188, 156',
                '--secondary-color': '#76d7c4',
                '--background-color': '#f4fcfb',
                '--card-color': '#ffffff',
                '--text-color': '#0e6251',
                '--text-secondary': '#54998c',
                '--text-on-primary': '#ffffff',
                '--border-color': '#d1f2eb',
                '--success-color': '#27ae60',
                '--danger-color': '#c0392b',
                '--warning-color': '#f39c12',
                '--info-color': '#1abc9c',
                '--datepicker-bg': '#f8fefd',
                '--datepicker-text-color': '#0e6251',
                '--datepicker-hover-bg': '#d1f2eb',
                '--datepicker-active-text-color': '#ffffff',
            },
        }
    ]
);

const activeThemeName = ref(actualThemes.value.length > 0 ? actualThemes.value[0].name : '');

// Helper function to apply theme styles to the document
const _applyThemeStyles = (themeName: string) => {
    const themeToApply = actualThemes.value.find(t => t.name === themeName);
    if (themeToApply) {
        Object.entries(themeToApply.colors).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        activeThemeName.value = themeName;
    } else {
        console.warn(`Theme styles for "${themeName}" not found.`);
    }
};

export function useTheme() {
    const authStore = useAuthStore();
    const { showToast } = useToast();

    const applyTheme = async (themeName: string) => {
        const themeIndex = actualThemes.value.findIndex(t => t.name === themeName);
        if (themeIndex === -1) {
            showToast('选择的主题未找到', 'error');
            return;
        }
        const themeId = themeIndex + 1; // 1-based ID for API

        // 应用样式到DOM
        _applyThemeStyles(themeName);

        // 如果用户已登录，则尝试更新后端并保存到localStorage
        if (authStore.isAuthenticated) {
            try {
                await api.updateUserTheme(themeId);
                // API成功后（没有抛出错误），更新store和localStorage
                if (authStore.user) {
                    authStore.user.theme = themeId;
                    localStorage.setItem('user', JSON.stringify(authStore.user));
                }
                // 成功提示由 api.updateUserTheme -> handleApiResponse 处理
            } catch (error: any) {
                // 错误提示由 api.updateUserTheme -> handleApiResponse 处理
                console.error('Failed to update theme via API:', error);
                // 可选：如果API调用失败，是否需要回滚本地主题更改？
                // 例如，可以重新加载用户之前的主题：
                // if (authStore.user && authStore.user.theme) {
                //     const previousTheme = actualThemes.value[authStore.user.theme - 1];
                //     if (previousTheme) _applyThemeStyles(previousTheme.name);
                // } else if (actualThemes.value.length > 0) {
                //     _applyThemeStyles(actualThemes.value[0].name); // 或者回滚到默认主题
                // }
            }
        } else {
            // 用户未登录，仅应用主题，不进行API调用或本地存储
            // showToast('主题已在本地切换', 'info'); // 可选：给未登录用户一个提示
        }
    };

    const initTheme = () => {
        // IMPORTANT: Call this function in your App.vue or main.ts *after*
        // the authStore has loaded the user (e.g., from localStorage or initial API fetch).
        // Ensure authStore.user includes a 'theme: number' property (1-based index).
        if (authStore.user && authStore.user.theme) {
            const userThemeId = authStore.user.theme;
            if (userThemeId > 0 && userThemeId <= actualThemes.value.length) {
                const themeToApply = actualThemes.value[userThemeId - 1]; // Convert 1-based ID to 0-based index
                if (themeToApply) {
                    _applyThemeStyles(themeToApply.name);
                } else {
                    // Should not happen if IDs are consistent
                    if (actualThemes.value.length > 0) _applyThemeStyles(actualThemes.value[0].name);
                }
            } else {
                // Invalid theme ID from user data, apply default
                if (actualThemes.value.length > 0) _applyThemeStyles(actualThemes.value[0].name);
            }
        } else {
            // No theme preference in user data, or no user logged in, apply default
            if (actualThemes.value.length > 0) _applyThemeStyles(actualThemes.value[0].name);
        }
    };

    // Expose the reactive themes array for iteration in components
    const themes = computed(() => actualThemes.value);

    return {
        themes, // For iterating in AboutView.vue
        activeThemeName, // For :class="{ active: ... }" in AboutView.vue
        applyTheme, // For @click handler in AboutView.vue
        initTheme, // To be called globally on app startup
    };
}