/**
 * 分类元数据常量
 * 统一管理分类的图标、描述、渐变色等展示信息
 * 后端返回的分类 key 作为索引
 */

export interface CategoryMetaConfig {
  icon: string
  name: string
  desc: string
  color: string // Tailwind gradient class
}

export const CATEGORY_META: Record<string, CategoryMetaConfig> = {
  java: {
    icon: '☕',
    name: 'Java 后端开发',
    desc: 'JVM、并发、Spring、MySQL、Redis 等',
    color: 'from-orange-400 to-red-500',
  },
  golang: {
    icon: '🐹',
    name: 'Go 后端开发',
    desc: '语法、并发、GMP、标准库、框架等',
    color: 'from-cyan-400 to-blue-500',
  },
  agent: {
    icon: '🤖',
    name: 'AI Agent 开发',
    desc: 'LLM、RAG、Agent、Function Calling、LangChain 等',
    color: 'from-purple-400 to-indigo-500',
  },
  docker: {
    icon: '🐳',
    name: 'Docker 容器技术',
    desc: '镜像、容器、Dockerfile、Compose、网络等',
    color: 'from-blue-400 to-cyan-500',
  },
}

export const DEFAULT_CATEGORY_META: CategoryMetaConfig = {
  icon: '📦',
  name: '未分类',
  desc: '',
  color: 'from-gray-400 to-gray-500',
}

/** 获取分类配置，找不到返回默认 */
export function getCategoryMeta(key: string): CategoryMetaConfig {
  return CATEGORY_META[key] || DEFAULT_CATEGORY_META
}

/** 获取分类显示名 */
export function getCategoryLabel(key: string): string {
  const meta = getCategoryMeta(key)
  return `${meta.icon} ${meta.name}`
}
