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
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="bg-white border border-gray-200 rounded p-3 shadow-sm flex items-center"
          >
            <span className="mr-2">{todo.done ? '✅' : '🔲'}</span>
            <span>{todo.content}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
