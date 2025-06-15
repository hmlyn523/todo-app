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
  const [showAll, setShowAll] = useState(false);

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

    // ページング用状態
  const [page, setPage] = useState(1);
  const pageSize = 5; // 1ページあたりの件数
  const [totalCount, setTotalCount] = useState(0);

  const fetchTodos = async () => {
    let query = supabase.from('todos').select('*', { count: 'exact' });

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

    // ページング指定
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      console.error(error);
    } else {
      setTodos(data as Todo[]);
      setTotalCount(count || 0);
    }
  };

    // ページ変更時や検索条件が変わったら1ページ目に戻すためのeffect
  useEffect(() => {
    setPage(1);
  }, [searchContent, searchDate, searchCategory, searchTag, searchDone]);


  useEffect(() => {
    fetchTodos();
  }, [page, searchContent, searchDate, searchCategory, searchTag, searchDone]);

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
      setShowAddForm(false);
      setPage(1);
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

  // ページ数計算
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <main className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Simple ToDo List</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          ➕ Add
        </button>
        <button onClick={() => setShowSearchForm(!showSearchForm)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          🔍 Search
        </button>
      </div>

      {showAddForm && (
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder="(Required) ToDo Contents"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="border p-2 rounded"/>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            placeholder="(Optional) Deadline"
            className="border p-2 rounded"/>
          <input
            type="text"
            placeholder="(Optional) Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border p-2 rounded"/>
          <input
            type="text"
            placeholder="(Optional) Tags (separated by commas and spaces)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className="border p-2 rounded"/>
          <button
            onClick={addTodo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            OK
          </button>
        </div>
      )}

      {showSearchForm && (
        <div className="border-t mt-6 pt-4">
          <h2 className="font-semibold mb-2">🔍 Search Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="ToDo Contents"
              value={searchContent}
              onChange={(e) => setSearchContent(e.target.value)}
              className="border p-2 rounded"/>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="(Optional) Deadline"
              className="border p-2 rounded"/>
            <input
              type="text"
              placeholder="Category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="border p-2 rounded"/>
            <input
              type="text"
              placeholder="Tag"
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="border p-2 rounded"/>
            <select
              value={searchDone}
              onChange={(e) => setSearchDone(e.target.value as 'all' | 'done' | 'notDone')}
              className="border rounded h-10 text-base px-3">
              <option value="all">All</option>
              <option value="done">Completion</option>
              <option value="notDone">Incomplete</option>
            </select>
            <button
              onClick={() => {
                setSearchContent('');
                setSearchDate('');
                setSearchCategory('');
                setSearchTag('');
                setSearchDone('all');
                setPage(1);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              🧹 クリア
            </button>
          </div>
        </div>
      )}

      <div className="border-t mt-6 pt-4">
        <div className="mb-4 flex items-center">
          <label className="mr-2 font-semibold">Show Completed:</label>
          <input
            type="checkbox"
            checked={showAll}
            className="w-5 h-5 scale-100"
            onChange={(e) => setShowAll(e.target.checked)}/>
        </div>
      </div>

      <div className="my-4">
        <p>Number of ToDos: {totalCount}case（{page} / {totalPages}page）</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="bg-gray-400 px-3 py-1.5 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="bg-gray-400 px-3 py-1.5 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {todos
          .filter((todo) => showAll || !todo.done)
          .map((todo) => (
            <li
              key={todo.id}
              className="border border-gray-200 rounded p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleDone(todo.id, todo.done)}
                  className="text-xl leading-none pt-1">
                  <span className="align-middle">{todo.done ? '☑️' : '🔲'}</span>
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
                      placeholder="Category"
                      value={editingCategory}
                      onChange={(e) => setEditingCategory(e.target.value)}
                      className="border p-1 rounded"/>
                    <input
                      type="text"
                      placeholder="Tag"
                      value={editingTags}
                      onChange={(e) => setEditingTags(e.target.value)}
                      className="border p-1 rounded"/>
                  </div>
                ) : (
                  <div>
                    <p className={todo.done ?
                      'text-base whitespace-pre-wrap break-words text-xl text-gray-500 line-through' :
                      'text-base whitespace-pre-wrap break-words text-xl'}>
                      {todo.content}
                    </p>
                    <p className="text-base">
                      {todo.due_date ? `Cofferdam: ${todo.due_date}` : ''}
                      {todo.category ? ` / Category: ${todo.category}` : ''}
                      {todo.tags?.length ? ` / Tag: ${todo.tags.join(', ')}` : ''}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-4">
                {editingId === todo.id ? (
                  <button
                    onClick={() => updateTodo(todo.id)}
                    className="text-green-500">
                    💾 Save
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
                    className="text-blue-500">
                    ✏️ Edit
                  </button>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500">
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
      </ul>
    </main>
  );
}
