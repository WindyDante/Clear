<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

interface Props {
    name: string // SVG 文件名（不包含 .svg 扩展名）
    color?: 'default' | 'primary' | 'secondary' | 'text' | 'text-secondary' // 颜色类型
    size?: number // 图标大小
    alt?: string // 替代文本
}

const props = withDefaults(defineProps<Props>(), {
    color: 'default',
    size: 20,
    alt: ''
})

const svgContent = ref<string>('')

// 根据颜色类型获取对应的 CSS 变量值
const getColorValue = () => {
    switch (props.color) {
        case 'primary':
            return getComputedStyle(document.documentElement).getPropertyValue('--icon-primary').trim()
        case 'secondary':
            return getComputedStyle(document.documentElement).getPropertyValue('--icon-secondary').trim()
        case 'text':
            return getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
        case 'text-secondary':
            return getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
        default:
            return getComputedStyle(document.documentElement).getPropertyValue('--icon-color').trim()
    }
}

// 加载并处理 SVG 内容
const loadSvg = async () => {
    try {
        const response = await fetch(`/${props.name}.svg`)
        if (response.ok) {
            let svg = await response.text()

            // 移除 XML 声明和 DOCTYPE
            svg = svg.replace(/<\?xml[^>]*\?>/g, '')
            svg = svg.replace(/<!DOCTYPE[^>]*>/g, '')

            const currentColor = getColorValue()

            // 替换固定颜色为当前颜色
            // 常见的黑色值
            svg = svg.replace(/fill="#000000"/g, `fill="${currentColor}"`)
            svg = svg.replace(/fill="#000"/g, `fill="${currentColor}"`)
            svg = svg.replace(/fill="black"/g, `fill="${currentColor}"`)
            svg = svg.replace(/fill="#040000"/g, `fill="${currentColor}"`) // 添加这个特殊的黑色值

            // 常见的白色值
            svg = svg.replace(/fill="#ffffff"/g, `fill="${currentColor}"`)
            svg = svg.replace(/fill="#fff"/g, `fill="${currentColor}"`)
            svg = svg.replace(/fill="white"/g, `fill="${currentColor}"`)

            // 添加对 #C4C6CF 这个特定颜色的替换
            svg = svg.replace(/fill="#C4C6CF"/g, `fill="${currentColor}"`)
            svg = svg.replace(/fill="#c4c6cf"/g, `fill="${currentColor}"`)

            // 更通用的颜色替换：替换所有深色值（RGB值都小于50的颜色）
            svg = svg.replace(/fill="#([0-9a-fA-F]{6})"/g, (match, color) => {
                const r = parseInt(color.substr(0, 2), 16)
                const g = parseInt(color.substr(2, 2), 16)
                const b = parseInt(color.substr(4, 2), 16)
                // 如果是深色（所有RGB分量都小于50），则替换为主题颜色
                if (r < 50 && g < 50 && b < 50) {
                    return `fill="${currentColor}"`
                }
                return match
            })

            // 如果没有 fill 属性，为 path 添加一个
            if (!svg.includes('fill=')) {
                svg = svg.replace(/<path/g, `<path fill="${currentColor}"`)
            }

            // 设置 SVG 的基本属性
            svg = svg.replace(/<svg[^>]*>/, (match) => {
                // 移除原有的 width 和 height 属性
                let newSvg = match.replace(/width="[^"]*"/g, '')
                newSvg = newSvg.replace(/height="[^"]*"/g, '')

                // 添加新的尺寸
                newSvg = newSvg.replace('<svg', `<svg width="${props.size}" height="${props.size}"`)

                return newSvg
            })

            svgContent.value = svg
        } else {
            console.warn(`Failed to load SVG: ${props.name}.svg`)
        }
    } catch (error) {
        console.error(`Error loading SVG: ${props.name}.svg`, error)
    }
}

onMounted(() => {
    loadSvg()
})

// 监听颜色和尺寸变化
watch([() => props.color, () => props.size], () => {
    if (svgContent.value) {
        loadSvg()
    }
})

// 监听主题变化（通过监听 CSS 变量的变化）
const observer = new MutationObserver(() => {
    if (svgContent.value) {
        loadSvg()
    }
})

onMounted(() => {
    // 监听 document.documentElement 的 style 属性变化
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
    })
})
</script>

<template>
    <div class="svg-icon" :style="{ width: `${size}px`, height: `${size}px` }" v-html="svgContent" :title="alt" />
</template>

<style scoped>
.svg-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.svg-icon :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
}
</style>