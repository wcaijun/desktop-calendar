const { Client } = require('evernote');
const { Types } = require('evernote');
const { Errors } = require('evernote');

const STATE_KEY = 'evernote';

const EDAM_ERROR_NAMES = {};
for (const k in Errors.EDAMErrorCode) {
  EDAM_ERROR_NAMES[Errors.EDAMErrorCode[k]] = k;
}

function formatError(err) {
  if (!err) return '未知错误';
  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string' && err.message !== '[object Object]') return err.message;
  if (err.errorCode !== undefined) {
    const name = EDAM_ERROR_NAMES[err.errorCode] || ('errorCode=' + err.errorCode);
    const parts = [name];
    if (err.parameter) parts.push('parameter=' + err.parameter);
    return parts.join(' ');
  }
  try { return JSON.stringify(err); } catch (e) { return String(err); }
}

function getSyncState(data) {
  if (!data[STATE_KEY]) data[STATE_KEY] = {
    connected: false,
    token: null,
    noteStoreUrl: null,
    lastSync: null,
    syncMap: {},
    conflictLog: []
  };
  return data[STATE_KEY];
}

function setSyncState(data, state) {
  data[STATE_KEY] = state;
}

function getNoteStoreClient(state) {
  if (!state.token || !state.noteStoreUrl) return null;
  const client = new Client({
    token: state.token,
    sandbox: false,
    china: true
  });
  return client.getNoteStore(state.noteStoreUrl);
}

function dateNoteTitle(dateStr) {
  return dateStr + ' 待办';
}

const ENML_DTD_URL = 'http://xml.evernote.com/pub/enml2.dtd';
const ENML_NOTE_NS = 'http://xml.evernote.com/pub/enml2.dtd';

function todosToENML(dateStr, todos) {
  const items = todos.map(t => {
    const checked = t.done ? 'true' : 'false';
    const text = t.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<li><en-todo checked="${checked}"/>${text}</li>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "${ENML_DTD_URL}">
<en-note xmlns="${ENML_NOTE_NS}">
<div>${dateStr} 待办（桌面校历同步）</div>
<ul style="list-style:none;padding-left:0;">
${items}
</ul>
<div><br/><i>由桌面校历自动同步 · ${new Date().toLocaleString('zh-CN')}</i></div>
</en-note>`;
}

function parseENML(enmlContent) {
  if (!enmlContent || typeof enmlContent !== 'string') return [];
  const todos = [];
  const regex = /<en-todo\s+checked="(true|false)"\/>([^<]*(?:<[^>]*>[^<]*<\/[^>]*>)*[^<]*)/g;
  let m;
  let idx = 0;
  while ((m = regex.exec(enmlContent)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      todos.push({
        enIndex: idx,
        done: m[1] === 'true',
        text: text
      });
      idx++;
    }
  }
  return todos;
}

function findNoteByDate(noteStore, dateStr) {
  const filter = new (require('evernote').NoteStore).NoteFilter({
    words: `intitle:"${dateNoteTitle(dateStr)}"`,
    ascending: false
  });
  const spec = new (require('evernote').NoteStore).NotesMetadataResultSpec({
    title: true,
    updated: true
  });
  return noteStore.findNotesMetadata(filter, 0, 1, spec).then(result => {
    if (result && result.notes && result.notes.length > 0) {
      return result.notes[0];
    }
    return null;
  });
}

function getNoteContent(noteStore, noteGuid) {
  return noteStore.getNote(noteGuid, true, false, false, false).then(note => {
    return (note && note.content) || '';
  });
}

function createNote(noteStore, dateStr, todos) {
  const note = new Types.Note({
    title: dateNoteTitle(dateStr),
    content: todosToENML(dateStr, todos)
  });
  return noteStore.createNote(note).then(createdNote => {
    return createdNote;
  });
}

function updateNote(noteStore, noteGuid, dateStr, todos) {
  const note = new Types.Note({
    guid: noteGuid,
    title: dateNoteTitle(dateStr),
    content: todosToENML(dateStr, todos)
  });
  return noteStore.updateNote(note).then(updatedNote => {
    return updatedNote;
  });
}

function pushDateTodos(data, dateStr, todos) {
  const state = getSyncState(data);
  const noteStore = getNoteStoreClient(state);
  if (!noteStore) return Promise.reject(new Error('未连接印象笔记'));

  return findNoteByDate(noteStore, dateStr).then(existingNote => {
    if (existingNote) {
      return updateNote(noteStore, existingNote.guid, dateStr, todos).then(() => {
        if (!state.syncMap[dateStr]) state.syncMap[dateStr] = {};
        state.syncMap[dateStr].noteId = existingNote.guid;
        state.syncMap[dateStr].todos = todos.map((t, i) => ({
          localId: t.id,
          enIndex: i
        }));
        state.lastSync = Date.now();
        return { dateStr, action: 'updated', noteGuid: existingNote.guid };
      });
    } else {
      return createNote(noteStore, dateStr, todos).then(createdNote => {
        if (!state.syncMap[dateStr]) state.syncMap[dateStr] = {};
        state.syncMap[dateStr].noteId = createdNote.guid;
        state.syncMap[dateStr].todos = todos.map((t, i) => ({
          localId: t.id,
          enIndex: i
        }));
        state.lastSync = Date.now();
        return { dateStr, action: 'created', noteGuid: createdNote.guid };
      });
    }
  });
}

function pullDateTodos(data, dateStr) {
  const state = getSyncState(data);
  const noteStore = getNoteStoreClient(state);
  if (!noteStore) return Promise.reject(new Error('未连接印象笔记'));

  return findNoteByDate(noteStore, dateStr).then(existingNote => {
    if (!existingNote) return null;
    return getNoteContent(noteStore, existingNote.guid).then(content => {
      const remoteTodos = parseENML(content);
      const localTodos = data.todos[dateStr] || [];
      const syncEntry = state.syncMap[dateStr] || {};
      const merged = [];
      const conflicts = [];

      for (let i = 0; i < remoteTodos.length; i++) {
        const rt = remoteTodos[i];
        const localMatch = syncEntry.todos && syncEntry.todos.find(st => st.enIndex === i);
        if (localMatch) {
          const lt = localTodos.find(t => t.id === localMatch.localId);
          if (lt) {
            if (lt.done !== rt.done || lt.text !== rt.text) {
              conflicts.push({
                dateStr,
                local: lt,
                remote: rt,
                resolution: 'local'
              });
              merged.push(lt);
            } else {
              merged.push(lt);
            }
          } else {
            const newId = 't' + Date.now() + Math.floor(Math.random() * 1000);
            merged.push({ id: newId, text: rt.text, done: rt.done });
            if (!syncEntry.todos) syncEntry.todos = [];
            syncEntry.todos.push({ localId: newId, enIndex: i });
          }
        } else {
          const newId = 't' + Date.now() + Math.floor(Math.random() * 1000);
          merged.push({ id: newId, text: rt.text, done: rt.done });
          if (!syncEntry.todos) syncEntry.todos = [];
          syncEntry.todos.push({ localId: newId, enIndex: i });
        }
      }

      for (const lt of localTodos) {
        const matched = syncEntry.todos && syncEntry.todos.some(st => st.localId === lt.id);
        if (!matched) merged.push(lt);
      }

      if (!state.syncMap[dateStr]) state.syncMap[dateStr] = {};
      state.syncMap[dateStr].noteId = existingNote.guid;
      state.lastSync = Date.now();
      if (conflicts.length > 0) {
        state.conflictLog.push(...conflicts);
        if (state.conflictLog.length > 50) state.conflictLog.splice(0, state.conflictLog.length - 50);
      }
      return { dateStr, todos: merged, conflicts };
    });
  });
}

function pushAllTodos(data) {
  const state = getSyncState(data);
  const noteStore = getNoteStoreClient(state);
  if (!noteStore) return Promise.reject(new Error('未连接印象笔记'));

  const dates = Object.keys(data.todos || {});
  const promises = dates.map(dateStr => {
    const todos = data.todos[dateStr] || [];
    if (!todos.length) return Promise.resolve(null);
    return pushDateTodos(data, dateStr, todos).then(result => {
      return { dateStr, action: result.action };
    }).catch(err => {
      throw new Error('推送 ' + dateStr + ' 失败：' + formatError(err));
    });
  });

  return Promise.all(promises).then(results => {
    const successful = results.filter(r => r !== null);
    state.lastSync = Date.now();
    return { total: successful.length, dates: successful.map(r => r.dateStr) };
  });
}

function fullSync(data) {
  const state = getSyncState(data);
  const noteStore = getNoteStoreClient(state);
  if (!noteStore) return Promise.reject(new Error('未连接印象笔记'));

  return pushAllTodos(data).then(pushResult => {
    const filter = new (require('evernote').NoteStore).NoteFilter({
      words: 'intitle:待办',
      ascending: false
    });
    const spec = new (require('evernote').NoteStore).NotesMetadataResultSpec({
      title: true,
      updated: true
    });

    return noteStore.findNotesMetadata(filter, 0, 100, spec).then(result => {
      const notes = (result && result.notes) || [];
      const validNotes = notes.filter(n => n && n.guid && typeof n.title === 'string' && /^\d{4}-\d{2}-\d{2}\s+待办$/.test(n.title.trim()));
      const promises = validNotes.map(note => {
        return getNoteContent(noteStore, note.guid).then(content => {
          const remoteTodos = parseENML(content);
          const dateStr = note.title.trim().replace(/\s+待办$/, '');
          const localTodos = data.todos[dateStr] || [];
          const syncEntry = state.syncMap[dateStr] || {};
          const merged = [];

          for (let i = 0; i < remoteTodos.length; i++) {
            const rt = remoteTodos[i];
            const localMatch = syncEntry.todos && syncEntry.todos.find(st => st.enIndex === i);
            if (localMatch) {
              const lt = localTodos.find(t => t.id === localMatch.localId);
              if (lt) {
                merged.push(lt.done !== rt.done ? { ...lt, done: rt.done } : lt);
              } else {
                const newId = 't' + Date.now() + Math.floor(Math.random() * 1000);
                merged.push({ id: newId, text: rt.text, done: rt.done });
                if (!syncEntry.todos) syncEntry.todos = [];
                syncEntry.todos.push({ localId: newId, enIndex: i });
              }
            } else {
              const newId = 't' + Date.now() + Math.floor(Math.random() * 1000);
              merged.push({ id: newId, text: rt.text, done: rt.done });
              if (!syncEntry.todos) syncEntry.todos = [];
              syncEntry.todos.push({ localId: newId, enIndex: i });
            }
          }

          for (const lt of localTodos) {
            const matched = syncEntry.todos && syncEntry.todos.some(st => st.localId === lt.id);
            if (!matched) merged.push(lt);
          }

          if (!state.syncMap[dateStr]) state.syncMap[dateStr] = {};
          state.syncMap[dateStr].noteId = note.guid;
          state.lastSync = Date.now();
          return { dateStr, todos: merged };
        }).catch(err => {
          throw new Error('读取笔记 ' + (note.title || note.guid || '?') + ' 失败：' + formatError(err));
        });
      });

      return Promise.all(promises).then(results => {
        const successful = results.filter(r => r !== null);
        const todosByDate = {};
        for (const r of successful) {
          data.todos[r.dateStr] = r.todos;
          todosByDate[r.dateStr] = r.todos;
        }
        state.lastSync = Date.now();
        return {
          total: successful.length,
          dates: successful.map(r => r.dateStr),
          todosByDate: todosByDate,
          pushTotal: pushResult.total,
          rawCount: notes.length,
          validCount: validNotes.length
        };
      });
    }).catch(err => {
      throw new Error('查找笔记失败：' + formatError(err));
    });
  });
}

function testConnection(data) {
  const state = getSyncState(data);
  if (!state.token || !state.noteStoreUrl) {
    return Promise.reject(new Error('请先填写 Token 和 NoteStore URL'));
  }
  const client = new Client({ token: state.token, sandbox: false, china: true });
  const noteStore = client.getNoteStore(state.noteStoreUrl);
  return noteStore.listNotebooks().then(nbs => {
    return { ok: true, notebookCount: nbs.length, notebooks: nbs.map(nb => nb.name) };
  });
}

module.exports = {
  getSyncState,
  setSyncState,
  getNoteStoreClient,
  pushDateTodos,
  pullDateTodos,
  pushAllTodos,
  fullSync,
  testConnection,
  parseENML,
  todosToENML,
  dateNoteTitle
};
