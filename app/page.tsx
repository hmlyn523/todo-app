'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Todo = {
  id: string;
  content: string;
  done: boolean;
  created_at: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('データ取得エラー:', error.message);
      return;
    }
    setTodos(data || []);
  };

  const addTodo = async () => {
    const trimmed = newTodo.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('todos')
      .insert({ content: trimmed, done: false });

    if (error) {
      console.error('追加エラー:', error.message);
      return;
    }

    setNewTodo('');
    fetchTodos();
  };

  const toggleDone = async (id: string, done: boolean) => {
    const { error } = await supabase
    .from('todos')
    .update({ done: !done })
    .eq('id', id);

    if (error) {
      console.error('更新エラー:', error.message);
      return;
    }

    fetchTodos(); // 再読み込み
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      console.error('削除エラー:', error.message);
      return;
    }
    fetchTodos();
  };

  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const updateTodo = async (id: string) => {
    if (!editingContent.trim()) return;

    const { error } = await supabase
      .from('todos')
      .update({ content: editingContent })
      .eq('id', id);

    if (error) {
      console.error('更新エラー:', error.message);
      return;
    }

    setEditingId(null);
    setEditingContent('');
    fetchTodos();
  };

  return (
    <main className="min-h-screen p-8 font-sans bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">📝 ToDo List</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="やることを入力"
          className="flex-1 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          onClick={addTodo}
        >
          追加
        </button>
      </div>

      <ul className="space-y-2">
        {todos
          .filter((todo) => showAll || !todo.done)
          .map((todo) => (
            <li
              key={todo.id}
              className="bg-white border border-gray-200 rounded p-3 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDone(todo.id, todo.done)}
                  className="text-xl">
                  {todo.done ? '✅' : '🔲'}
                </button>
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateTodo(todo.id);
                      }
                    }}
                    className="border p-1 rounded"/>
                ) : (
                  <span className={todo.done ? 'line-through text-gray-400' : ''}>
                    {todo.content}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
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
                    }}
                    className="text-blue-500 text-sm">
                    ✏️ 編集
                  </button>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 text-sm">
                  🗑️
                </button>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-black-600 underline">
                  {showAll ? '未完了のみ' : 'すべて'}
                </button>
              </div>
            </li>
          ))}
      </ul>
    </main>
  );
}
