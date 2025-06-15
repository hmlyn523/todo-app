'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Todo = {
  id: string;
  content: string;
  done: boolean;
  created_at: string;
  due_date: string | null;
  category: string | null;
  tags: string[] | null;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTags, setNewTags] = useState('');
  const [showAll, setShowAll] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingDueDate, setEditingDueDate] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [editingTags, setEditingTags] = useState('');

  const [searchContent, setSearchContent] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [searchDone, setSearchDone] = useState<'all' | 'done' | 'notDone'>('all');

  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  const fetchTodos = async () => {
    let query = supabase.from('todos').select('*');

    // 各種フィルター条件の追加
    if (searchContent.trim() !== '') {
      query = query.ilike('content', `%${searchContent}%`);
    }
    if (searchDate !== '') {
      query = query.eq('due_date', searchDate);
    }
    if (searchCategory.trim() !== '') {
      query = query.ilike('category', `%${searchCategory}%`);
    }
    if (searchTag.trim() !== '') {
      query = query.contains('tags', [searchTag]);
    }
    if (searchDone === 'done') {
      query = query.eq('done', true);
    } else if (searchDone === 'notDone') {
      query = query.eq('done', false);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error(error);
    } else {
      setTodos(data as Todo[]);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const tagsArray = newTags
      .split(/[,、\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { error } = await supabase.from('todos').insert({
      content: newTodo,
      done: false,
      due_date: newDueDate || null,
      category: newCategory || null,
      tags: tagsArray.length ? tagsArray : null,
    });

    if (error) {
      console.error(error);
    } else {
      setNewTodo('');
      setNewDueDate('');
      setNewCategory('');
      setNewTags('');
      fetchTodos();
    }
  };

  const toggleDone = async (id: string, done: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ done: !done })
      .eq('id', id);
    if (!error) fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) fetchTodos();
  };

  const updateTodo = async (id: string) => {
    const tagsArray = editingTags
      .split(/[,、\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from('todos')
      .update({
        content: editingContent,
        due_date: editingDueDate || null,
        category: editingCategory || null,
        tags: tagsArray.length ? tagsArray : null,
      })
      .eq('id', id);
    if (!error) {
      setEditingId(null);
      setEditingContent('');
      setEditingDueDate('');
      setEditingCategory('');
      setEditingTags('');
      fetchTodos();
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">ToDo リスト</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          ➕ ToDo追加
        </button>
        <button onClick={() => setShowSearchForm(!showSearchForm)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          🔍 検索
        </button>
      </div>

      {showAddForm && (
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder="（必須）ToDo 内容"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="border p-2 rounded"/>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="border p-2 rounded"/>
          <input
            type="text"
            placeholder="（任意）カテゴリ"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border p-2 rounded"/>
          <input
            type="text"
            placeholder="（任意）タグ（カンマ・空白区切り）"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className="border p-2 rounded"/>
          <button
            onClick={addTodo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            追加
          </button>
        </div>
      )}

      {showSearchForm && (
        <div className="border-t mt-6 pt-4">
          <h2 className="font-semibold mb-2">🔍 検索フィルター</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="ToDo 内容"
              value={searchContent}
              onChange={(e) => setSearchContent(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="カテゴリ"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="タグ"
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={searchDone}
              onChange={(e) => setSearchDone(e.target.value as 'all' | 'done' | 'notDone')}
              className="border p-2 rounded"
            >
              <option value="all">すべて</option>
              <option value="done">完了</option>
              <option value="notDone">未完了</option>
            </select>
            <button
              onClick={fetchTodos}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              検索
            </button>
          </div>
        </div>
      )}

      <div className="border-t mt-6 pt-4">
        <div className="mb-4">
          <label className="mr-2 font-semibold">完了済みを表示:</label>
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}/>
        </div>
      </div>

      <ul className="space-y-2">
        {todos
          .filter((todo) => showAll || !todo.done)
          .map((todo) => (
            <li
              key={todo.id}
              className="bg-white border border-gray-200 rounded p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <button
                  onClick={() => toggleDone(todo.id, todo.done)}
                  className="text-xl">
                  {todo.done ? '✅' : '🔲'}
                </button>

                {editingId === todo.id ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="border p-1 rounded"/>
                    <input
                      type="date"
                      value={editingDueDate}
                      onChange={(e) => setEditingDueDate(e.target.value)}
                      className="border p-1 rounded"/>
                    <input
                      type="text"
                      placeholder="カテゴリ"
                      value={editingCategory}
                      onChange={(e) => setEditingCategory(e.target.value)}
                      className="border p-1 rounded"/>
                    <input
                      type="text"
                      placeholder="タグ"
                      value={editingTags}
                      onChange={(e) => setEditingTags(e.target.value)}
                      className="border p-1 rounded"/>
                  </div>
                ) : (
                  <div>
                    <p className={todo.done ? 'line-through text-gray-400' : ''}>
                      {todo.content}
                    </p>
                    <p className="text-sm text-gray-500">
                      {todo.due_date ? `締切: ${todo.due_date}` : ''}
                      {todo.category ? ` / カテゴリ: ${todo.category}` : ''}
                      {todo.tags?.length ? ` / タグ: ${todo.tags.join(', ')}` : ''}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-4">
                {editingId === todo.id ? (
                  <button
                    onClick={() => updateTodo(todo.id)}
                    className="text-green-500 text-sm">
                    保存
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(todo.id);
                      setEditingContent(todo.content);
                      setEditingDueDate(todo.due_date || '');
                      setEditingCategory(todo.category || '');
                      setEditingTags(todo.tags?.join(' ') || '');
                    }}
                    className="text-blue-500 text-sm">
                    ✏️ 編集
                  </button>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 text-sm">
                  🗑️ 削除
                </button>
              </div>
            </li>
          ))}
      </ul>
    </main>
  );
}
