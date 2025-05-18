import { ref } from 'vue'

// 主题定义
export const themes = [
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
    }
];

// 主题状态和管理
export function useTheme() {
    const activeThemeName = ref(themes[0].name);

    // 应用主题 - 添加错误处理
    function applyTheme(themeName: string) {
        try {
            // 找到匹配的主题
            const selectedTheme = themes.find(t => t.name === themeName);
            if (!selectedTheme) {
                console.error(`主题 "${themeName}" 不存在`);
                return false;
            }

            // 应用主题样式变量
            for (const [key, value] of Object.entries(selectedTheme.colors)) {
                if (key && value) {
                    document.documentElement.style.setProperty(key, value);
                }
            }

            // 更新状态
            activeThemeName.value = themeName;
            localStorage.setItem('active-theme-name', themeName);
            return true;
        } catch (error) {
            console.error('应用主题时发生错误:', error);
            // 出错时应用默认主题
            applyDefaultTheme();
            return false;
        }
    }

    // 应用默认主题（第一个主题）
    function applyDefaultTheme() {
        try {
            const defaultTheme = themes[0];
            for (const [key, value] of Object.entries(defaultTheme.colors)) {
                if (key && value) {
                    document.documentElement.style.setProperty(key, value);
                }
            }
            activeThemeName.value = defaultTheme.name;
            localStorage.setItem('active-theme-name', defaultTheme.name);
        } catch (error) {
            console.error('应用默认主题时发生错误:', error);
        }
    }

    // 初始化主题 - 添加错误处理
    function initTheme() {
        try {
            // 首先应用默认主题（第一个）
            applyDefaultTheme();

            // 然后检查是否有保存的主题设置
            const savedThemeName = localStorage.getItem('active-theme-name');

            // 确保 savedThemeName 是一个有效的、存在于 themes 数组中的主题名称
            if (savedThemeName && savedThemeName !== 'undefined' && themes.some(t => t.name === savedThemeName)) {
                // 如果保存的主题不是当前已应用的默认主题，则应用它
                if (savedThemeName !== activeThemeName.value) {
                    applyTheme(savedThemeName);
                }
            } else if (savedThemeName) {
                // 如果 localStorage 中存在一个无效的主题名称（例如 "undefined" 或已不存在的主题）
                console.warn(`在 localStorage 中发现无效的主题名称 \"${savedThemeName}\"。将使用默认主题。`);
                localStorage.removeItem('active-theme-name'); // 清除无效的条目
                // applyDefaultTheme() 已经被调用，所以默认主题已激活
            }
        } catch (error) {
            console.error('初始化主题时发生错误:', error);
            // 确保至少基础变量被设置
            document.documentElement.style.setProperty('--background-color', '#f5f7fa');
            document.documentElement.style.setProperty('--text-color', '#3c4858');
            document.documentElement.style.setProperty('--card-color', '#ffffff');
        }
    }

    return {
        themes,
        activeThemeName,
        applyTheme,
        initTheme,
        applyDefaultTheme
    };
}