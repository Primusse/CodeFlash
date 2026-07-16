import { fetchJSON } from './client'
import type { Note } from '../types'

/** 获取笔记列表 */
export function getNotes(): Promise<Note[]> {
  return fetchJSON<{ notes: Note[] }>('/notes').then((r) => r.notes)
}

/** 创建笔记 */
export function createNote(note: Note): Promise<Note> {
  return fetchJSON<{ note: Note }>('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  }).then((r) => r.note)
}

/** 更新笔记 */
export function updateNote(id: string, note: Partial<Note>): Promise<Note> {
  return fetchJSON<{ note: Note }>(`/notes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  }).then((r) => r.note)
}

/** 删除笔记 */
export function deleteNote(id: string): Promise<boolean> {
  return fetchJSON(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(() => true)
}
