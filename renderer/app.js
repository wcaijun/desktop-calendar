const WEEK_DOW = ['一', '二', '三', '四', '五', '六', '日'];
const WEEK_KINDS = ['每周', '单周', '双周'];

const TIMETABLE_DEFAULT = [
  { startDate: '2026-09-07', endDate: '2026-12-26', dayNum: 1, weekKind: '每周', time: '08:00-09:40', course: '高等数学', teacher: '王建国', building: '教学楼', room: '教学楼-A101', major: '计算机科学与技术', klass: '25计算机1班', grade: '2025', courseType: '必修', college: '理学院' },
  { startDate: '2026-09-07', endDate: '2026-12-26', dayNum: 1, weekKind: '每周', time: '14:30-16:10', course: '大学英语', teacher: '李梅', building: '教学楼', room: '教学楼-B203', major: '计算机科学与技术', klass: '25计算机1班', grade: '2025', courseType: '必修', college: '外国语学院' },
  { startDate: '2026-09-07', endDate: '2026-12-26', dayNum: 2, weekKind: '每周', time: '10:00-11:40', course: '程序设计基础', teacher: '张强', building: '实验楼', room: '机房-C302', major: '计算机科学与技术', klass: '25计算机1班', grade: '2025', courseType: '必修', college: '计算机学院' },
  { startDate: '2026-09-07', endDate: '2026-12-19', dayNum: 3, weekKind: '单周', time: '14:30-16:10', course: '数据结构', teacher: '陈静', building: '教学楼', room: '教学楼-A305', major: '计算机科学与技术', klass: '25计算机1班', grade: '2025', courseType: '必修', college: '计算机学院' },
  { startDate: '2026-09-07', endDate: '2026-12-26', dayNum: 4, weekKind: '每周', time: '08:00-09:40', course: '线性代数', teacher: '赵磊', building: '教学楼', room: '教学楼-A210', major: '计算机科学与技术', klass: '25计算机1班', grade: '2025', courseType: '必修', college: '理学院' },
  { startDate: '2026-09-07', endDate: '2026-12-26', dayNum: 5, weekKind: '双周', time: '16:30-18:10', course: '体育（篮球）', teacher: '刘洋', building: '体育馆', room: '体育馆-1号场', major: '计算机科学与技术', klass: '25计算机1班', grade: '2025', courseType: '必修', college: '体育部' }
];

const THEMES = [
  { id: 'classic', name: '经典雅蓝' },
  { id: 'green', name: '青竹书苑' },
  { id: 'warm', name: '秋杏暖阳' },
  { id: 'sakura', name: '樱粉随笔' },
  { id: 'dark', name: '墨夜静读' }
];

function applyTheme(id) {
  document.body.dataset.theme = THEMES.some(t => t.id === id) ? id : 'classic';
}

function fillThemeSelect() {
  const sel = document.getElementById('themeSelect');
  sel.innerHTML = THEMES.map(t => `<option value="${t.id}" ${t.id === data.theme ? 'selected' : ''}>${t.name}</option>`).join('');
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fromISO(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function mondayOf(d) { const x = new Date(d); return addDays(x, -(x.getDay() + 6) % 7); }
function todayISO() { return iso(new Date()); }
function cnDate(s) { const d = fromISO(s); return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
function shortDate(s) { const d = fromISO(s); return (d.getMonth() + 1) + '.' + d.getDate(); }
function cnShort(s) { const d = fromISO(s); return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function applyOpacity(v) {
  const val = Math.min(1, Math.max(0.3, Number(v) || 0.85));
  document.documentElement.style.setProperty('--panel-alpha-val', val);
}

function defaultData() {
  return {
    version: 1,
    current: { year: '2026-2027', semester: '1' },
    years: {
      '2026-2027': {
        '1': {
          name: '第一学期',
          prepMonday: '2026-08-31',
          classWeeks: 18,
          examWeeks: 1,
          prepLabel: '开学准备周',
          examLabel: '考试与阅卷周',
          vacationLabel: '寒假',
          events: {
            '2026-09-05': '~学生报到',
            '2026-09-07': '上课',
            '2026-09-13': '~新生报到',
            '2026-09-14': '新生开学典礼暨军训动员',
            '2026-09-29': '~新生上课',
            '2026-10-01': '国庆节',
            '2026-10-03': '中秋节',
            '2026-10-19': '~校友文化周',
            '2026-10-20': '校庆节',
            '2026-10-31': '校友返校日',
            '2026-11-09': '~半期考试',
            '2027-01-01': '元旦节',
            '2027-01-11': '~期末考试开始',
            '2027-01-25': '寒假'
          },
          notes: [
            '1. 2026年9月5日学生报到，9月7日正式上课。',
            '2. 9月13日新生报到，9月14日新生开学典礼暨军训动员会，9月14日-9月28日新生军训，9月29日新生上课。',
            '3. 上课共计18周，第11周为半期考试周；2027年1月11日-1月22日为学生期末考试、教师阅卷时间。',
            '4. 2026年10月20日所在周为“校友文化周”。',
            '5. 2027年1月25日-2月26日为寒假。',
            '6. 2027年2月5日除夕，2月20日元宵节。'
          ]
        },
        '2': {
          name: '第二学期',
          prepMonday: '2027-02-22',
          classWeeks: 16,
          examWeeks: 2,
          prepLabel: '开学准备周',
          examLabel: '考试与阅卷周',
          vacationLabel: '暑假',
          events: {
            '2027-02-27': '~学生报到',
            '2027-03-01': '上课',
            '2027-04-05': '清明节',
            '2027-05-01': '劳动节',
            '2027-06-09': '端午节',
            '2027-06-21': '~期末考试',
            '2027-07-05': '暑假'
          },
          notes: [
            '1. 2027年2月27日学生报到，3月1日正式上课。',
            '2. 上课共计16周，期末考试与阅卷2周。',
            '3. 2027年7月5日起放暑假。',
            '4. 本学期节假日：清明节、劳动节、端午节。'
          ]
        }
      }
    },
    todos: {},
    timetable: clone(TIMETABLE_DEFAULT),
    evernote: {
      connected: false,
      token: null,
      noteStoreUrl: null,
      lastSync: null,
      syncMap: {},
      conflictLog: []
    }
  };
}

let data = null;
const state = { year: '', semester: '1', view: { type: 'sem' }, desktopMode: false };
let ttEditIndex = null;

function currentYearObj() { return data.years[state.year]; }
function currentSem() { const y = currentYearObj(); return y && y[state.semester] ? y[state.semester] : null; }

function buildWeeks(sem) {
  const weeks = [];
  const start = fromISO(sem.prepMonday);
  weeks.push({ name: sem.prepLabel || '开学准备周', monday: iso(start), type: 'prep' });
  const cw = sem.classWeeks || 18;
  for (let i = 0; i < cw; i++) {
    weeks.push({ name: '第' + (i + 1) + '周', monday: iso(addDays(start, 7 * (i + 1))), type: 'class', no: i + 1 });
  }
  const ew = sem.examWeeks || 0;
  for (let i = 0; i < ew; i++) {
    weeks.push({ name: sem.examLabel || '考试与阅卷周', monday: iso(addDays(start, 7 * (1 + cw + i))), type: 'exam' });
  }
  return weeks;
}

function weekTag(sem, dateStr) {
  if (!sem) return '';
  const weeks = buildWeeks(sem);
  for (const w of weeks) {
    const m = fromISO(w.monday);
    if (fromISO(dateStr) >= m && fromISO(dateStr) <= addDays(m, 6)) {
      if (w.type === 'prep') return '准备周';
      if (w.type === 'class') return w.name;
      return '考试周';
    }
  }
  return '';
}

function weekOfDate(sem, dateStr) {
  const weeks = buildWeeks(sem);
  for (const w of weeks) {
    const m = fromISO(w.monday);
    if (fromISO(dateStr) >= m && fromISO(dateStr) <= addDays(m, 6)) return w;
  }
  return null;
}

function todosOf(dateStr) { return getMergedTodos(dateStr); }

/* ================= 课表：数据与解析 ================= */

function courseStartMin(c) {
  const m = String(c.time || '').match(/(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 9999;
}

function coursesRawForDate(dateStr) {
  const timetable = data.timetable || [];
  const sem = currentSem();
  const d = fromISO(dateStr);
  const dow = (d.getDay() + 6) % 7 + 1;
  let classWeekIdx = null;
  if (sem) {
    const start = fromISO(sem.prepMonday);
    classWeekIdx = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000));
  }
  const out = [];
  for (const c of timetable) {
    if (!c || !c.startDate || !c.endDate) continue;
    const startD = fromISO(c.startDate);
    const endD = fromISO(c.endDate);
    if (d < startD || d > endD) continue;
    if (Number(c.dayNum) !== dow) continue;
    if (c.weekKind === '单周' && classWeekIdx !== null && classWeekIdx % 2 === 0) continue;
    if (c.weekKind === '双周' && classWeekIdx !== null && classWeekIdx % 2 === 1) continue;
    out.push(c);
  }
  out.sort((a, b) => courseStartMin(a) - courseStartMin(b));
  return out;
}

function getCoursesForDate(dateStr) {
  return coursesRawForDate(dateStr).map(c => {
    const who = [c.teacher, c.room].filter(Boolean).join('@');
    return {
      id: 'course_' + dateStr + '_' + c.time + '_' + c.course,
      text: (c.time ? c.time + ' ' : '') + c.course + (who ? '（' + who + '）' : ''),
      done: false,
      isCourse: true
    };
  });
}

function getMergedTodos(dateStr) {
  const userTodos = (data.todos[dateStr] || []).slice();
  const courseTodos = getCoursesForDate(dateStr);
  const courseKeys = new Set(courseTodos.map(c => c.text));
  const userCourseTexts = new Set();
  for (const u of userTodos) {
    if (u.isCourse) userCourseTexts.add(u.text);
  }
  const merged = userTodos.slice();
  for (const ct of courseTodos) {
    if (!userCourseTexts.has(ct.text)) merged.push(ct);
  }
  return merged;
}

/* 日期宽容解析：支持 2026-09-07 / 2026/9/7 / Excel 序列号 / Date 对象 */
function serialToISO(n) {
  if (!(n > 20000 && n < 80000)) return null;
  const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000);
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
}
function normDateAny(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date && !isNaN(v.getTime())) return iso(v);
  if (typeof v === 'number') return serialToISO(v);
  let s = String(v).trim();
  s = s.replace(/[ T]\d{1,2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/, '');
  if (/^\d{5}(\.\d+)?$/.test(s)) return serialToISO(Number(s));
  const m = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/);
  if (m) return m[1] + '-' + pad(Number(m[2])) + '-' + pad(Number(m[3]));
  const m2 = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (m2) return m2[1] + '-' + pad(Number(m2[2])) + '-' + pad(Number(m2[3]));
  return null;
}

function parseDayNum(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && v >= 1 && v <= 7) return v;
  const s = String(v).trim();
  if (/^[1-7]$/.test(s)) return Number(s);
  const map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '天': 7 };
  const m = s.match(/([一二三四五六日天])/);
  if (m) return map[m[1]];
  return null;
}

const TT_FIELD_HEADERS = {
  course: ['课程名称', '课程', '课名', 'course', 'coursename'],
  teacher: ['教师姓名', '教师', '老师', '授课教师', 'teacher'],
  dayNum: ['星期', '星期几', '周几', 'day', 'daynum', 'dayofweek'],
  time: ['上课时间', '时间', '节次', '时段', 'time'],
  weekKind: ['单双周', '周类型', '周次', 'weekkind'],
  startDate: ['起始时间', '开始时间', '开始日期', '起始日期', 'startdate', 'start'],
  endDate: ['结束时间', '结束日期', 'enddate', 'end'],
  room: ['场地名称', '上课地点', '地点', '教室', 'room'],
  building: ['教学楼', 'building'],
  major: ['专业', 'major'],
  klass: ['教学班', '班级', 'klass', 'class'],
  grade: ['年级', 'grade'],
  courseType: ['课程性质', 'coursetype'],
  college: ['开课学院', '学院', 'college']
};

function resolveHeader(headers, candidates) {
  const norm = headers.map(h => String(h).toLowerCase().replace(/\s/g, ''));
  for (const c of candidates) {
    const i = norm.indexOf(c);
    if (i >= 0) return i;
  }
  for (const c of candidates) {
    const i = norm.findIndex(h => h.includes(c));
    if (i >= 0) return i;
  }
  return -1;
}

function objectToCourse(o) {
  if (!o || typeof o !== 'object') return null;
  const headers = Object.keys(o);
  const get = (field) => {
    const i = resolveHeader(headers, TT_FIELD_HEADERS[field]);
    return i >= 0 ? o[headers[i]] : undefined;
  };
  const course = String(get('course') || '').trim();
  if (!course) return null;
  const dayNum = parseDayNum(get('dayNum'));
  if (!dayNum) return null;
  let weekKind = String(get('weekKind') || '每周').trim() || '每周';
  if (weekKind.includes('单')) weekKind = '单周';
  else if (weekKind.includes('双')) weekKind = '双周';
  else weekKind = '每周';
  const out = {};
  out.course = course;
  out.teacher = String(get('teacher') || '').trim();
  out.dayNum = dayNum;
  out.time = String(get('time') || '').trim();
  out.weekKind = weekKind;
  out.startDate = normDateAny(get('startDate')) || '2000-01-01';
  out.endDate = normDateAny(get('endDate')) || '2099-12-31';
  out.building = String(get('building') || '').trim();
  out.room = String(get('room') || '').trim();
  out.major = String(get('major') || '').trim();
  out.klass = String(get('klass') || '').trim();
  out.grade = String(get('grade') || '').trim();
  out.courseType = String(get('courseType') || '').trim();
  out.college = String(get('college') || '').trim();
  return out;
}

function normalizeCourse(o) {
  if (!o || typeof o !== 'object') return null;
  if (o.course === undefined && o.dayNum === undefined) return objectToCourse(o);
  const course = String(o.course || '').trim();
  if (!course) return null;
  const dayNum = parseDayNum(o.dayNum !== undefined ? o.dayNum : o.day);
  if (!dayNum) return null;
  let weekKind = String(o.weekKind || '每周').trim() || '每周';
  if (weekKind.includes('单')) weekKind = '单周';
  else if (weekKind.includes('双')) weekKind = '双周';
  else weekKind = '每周';
  const out = Object.assign({}, o);
  out.course = course;
  out.teacher = String(o.teacher || '').trim();
  out.dayNum = dayNum;
  out.time = String(o.time || '').trim();
  out.weekKind = weekKind;
  out.startDate = normDateAny(o.startDate) || '2000-01-01';
  out.endDate = normDateAny(o.endDate) || '2099-12-31';
  if (o.room !== undefined) out.room = String(o.room || '').trim();
  return out;
}

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function parseTimetableText(text) {
  const t = String(text || '').replace(/^\uFEFF/, '').trim();
  if (!t) return { ok: false, msg: '文件为空' };
  let items = null;
  if (t[0] === '[' || t[0] === '{') {
    try {
      let j = JSON.parse(t);
      if (j && !Array.isArray(j) && Array.isArray(j.timetable)) j = j.timetable;
      if (!Array.isArray(j)) return { ok: false, msg: 'JSON 内容不是课程数组' };
      items = j;
    } catch (e) {
      return { ok: false, msg: 'JSON 解析失败：' + e.message };
    }
  } else {
    const lines = t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length < 2) return { ok: false, msg: 'CSV 至少需要表头和一行数据' };
    const headers = parseCSVLine(lines[0]);
    const col = (candidates) => resolveHeader(headers, candidates);
    const idx = {};
    for (const field of Object.keys(TT_FIELD_HEADERS)) idx[field] = col(TT_FIELD_HEADERS[field]);
    if (idx.course < 0 || idx.dayNum < 0) {
      return { ok: false, msg: 'CSV 表头缺少「课程名称」或「星期」列' };
    }
    items = [];
    for (let li = 1; li < lines.length; li++) {
      const cells = parseCSVLine(lines[li]);
      const o = {};
      for (const field of Object.keys(idx)) {
        if (idx[field] >= 0 && cells[idx[field]] !== undefined && cells[idx[field]] !== '') {
          o[field] = cells[idx[field]];
        }
      }
      items.push(o);
    }
  }
  const list = [];
  let skipped = 0;
  for (const o of items) {
    const n = normalizeCourse(o);
    if (n) list.push(n); else skipped++;
  }
  if (!list.length) {
    return { ok: false, msg: '没有解析到有效课程' + (skipped ? '（跳过 ' + skipped + ' 条无效数据）' : '') };
  }
  return { ok: true, list, skipped };
}

function csvEscape(v) {
  v = String(v === null || v === undefined ? '' : v);
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

const TT_CSV_HEADERS = ['起始时间', '结束时间', '星期', '单双周', '上课时间', '课程名称', '教师姓名', '教学楼', '场地名称', '专业', '教学班', '年级', '课程性质', '开课学院'];

function timetableToCSV(tt) {
  const lines = tt.map(c => [
    c.startDate || '', c.endDate || '', '星期' + (WEEK_DOW[c.dayNum - 1] || ''), c.weekKind || '每周',
    c.time || '', c.course || '', c.teacher || '', c.building || '', c.room || '',
    c.major || '', c.klass || '', c.grade || '', c.courseType || '', c.college || ''
  ].map(csvEscape).join(','));
  return '\uFEFF' + TT_CSV_HEADERS.join(',') + '\n' + lines.join('\n');
}

/* ================= 课表：设置面板管理 ================= */

function renderTimetableList() {
  const listEl = document.getElementById('ttList');
  if (!listEl) return;
  const tt = Array.isArray(data.timetable) ? data.timetable : [];
  document.getElementById('ttCount').textContent = tt.length + ' 门课程';
  if (!tt.length) {
    listEl.innerHTML = '<div class="tt-empty">暂无课程，点击「添加课程」或「导入课表」</div>';
    return;
  }
  listEl.innerHTML = tt.map((c, i) => {
    const day = '星期' + (WEEK_DOW[c.dayNum - 1] || '?');
    const meta = [c.teacher, c.room, c.weekKind || '每周',
      (c.startDate && c.endDate && (c.startDate !== '2000-01-01' || c.endDate !== '2099-12-31'))
        ? shortDate(c.startDate) + ' — ' + shortDate(c.endDate) : '长期有效'
    ].filter(Boolean).join(' · ');
    return `<div class="tt-row">
      <div class="tt-info">
        <div class="tt-main">${esc(day)} ${esc(c.time || '')} · ${esc(c.course)}</div>
        <div class="tt-meta">${esc(meta)}</div>
      </div>
      <div class="tt-ops">
        <button class="btn" data-tt-edit="${i}">编辑</button>
        <button class="btn btn-danger-ghost" data-tt-del="${i}">删除</button>
      </div>
    </div>`;
  }).join('');
}

function openTtForm(idx) {
  ttEditIndex = (idx === undefined || idx === null) ? null : idx;
  const c = ttEditIndex !== null ? (data.timetable || [])[ttEditIndex] : null;
  document.getElementById('ttFormTitle').textContent = c ? '编辑课程' : '添加课程';
  document.getElementById('ttCourse').value = c ? (c.course || '') : '';
  document.getElementById('ttTeacher').value = c ? (c.teacher || '') : '';
  document.getElementById('ttRoom').value = c ? (c.room || '') : '';
  document.getElementById('ttDay').value = c ? String(c.dayNum || 1) : '1';
  document.getElementById('ttTime').value = c ? (c.time || '') : '';
  document.getElementById('ttWeekKind').value = c ? (c.weekKind || '每周') : '每周';
  document.getElementById('ttStart').value = (c && c.startDate && c.startDate !== '2000-01-01') ? c.startDate : '';
  document.getElementById('ttEnd').value = (c && c.endDate && c.endDate !== '2099-12-31') ? c.endDate : '';
  document.getElementById('ttForm').classList.remove('hidden');
  document.getElementById('ttCourse').focus();
}

function closeTtForm() {
  ttEditIndex = null;
  document.getElementById('ttForm').classList.add('hidden');
}

function saveTtForm() {
  const course = document.getElementById('ttCourse').value.trim();
  if (!course) { toast('请输入课程名称'); return; }
  const dayNum = parseInt(document.getElementById('ttDay').value, 10);
  if (!(dayNum >= 1 && dayNum <= 7)) { toast('请选择星期'); return; }
  const time = document.getElementById('ttTime').value.trim();
  if (!time) { toast('请输入上课时间，如 14:30-16:10'); return; }
  if (!Array.isArray(data.timetable)) data.timetable = [];
  const isEdit = ttEditIndex !== null;
  const obj = {
    course, dayNum, time,
    teacher: document.getElementById('ttTeacher').value.trim(),
    room: document.getElementById('ttRoom').value.trim(),
    weekKind: document.getElementById('ttWeekKind').value,
    startDate: normDateAny(document.getElementById('ttStart').value) || '2000-01-01',
    endDate: normDateAny(document.getElementById('ttEnd').value) || '2099-12-31'
  };
  if (isEdit) {
    const old = data.timetable[ttEditIndex] || {};
    data.timetable[ttEditIndex] = Object.assign({}, old, obj);
  } else {
    data.timetable.push(obj);
  }
  persist();
  renderTimetableList();
  closeTtForm();
  render();
  toast(isEdit ? '课程已更新' : '课程已添加');
}

function deleteTtRow(idx) {
  const tt = data.timetable || [];
  const c = tt[idx];
  if (!c) return;
  if (!confirm('确定删除课程「' + c.course + '」（星期' + (WEEK_DOW[c.dayNum - 1] || '?') + ' ' + (c.time || '') + '）吗？')) return;
  tt.splice(idx, 1);
  persist();
  renderTimetableList();
  render();
  toast('课程已删除');
}

async function importTimetable() {
  const r = await window.api.importTimetableFile();
  if (!r || !r.ok) {
    if (r && r.msg) toast('导入失败：' + r.msg);
    return;
  }
  let parsed = null;
  if (r.rows) {
    const list = [];
    let skipped = 0;
    for (const o of r.rows) {
      const n = normalizeCourse(o);
      if (n) list.push(n); else skipped++;
    }
    parsed = list.length ? { ok: true, list, skipped } : { ok: false, msg: '没有解析到有效课程' };
  } else {
    parsed = parseTimetableText(r.content);
  }
  if (!parsed.ok) { toast('导入失败：' + parsed.msg); return; }
  const cur = Array.isArray(data.timetable) ? data.timetable.length : 0;
  const skipNote = parsed.skipped ? '，跳过 ' + parsed.skipped + ' 条无效数据' : '';
  if (!confirm('解析到 ' + parsed.list.length + ' 门课程' + skipNote + '。\n\n确定用导入的课表替换当前 ' + cur + ' 门课程吗？\n（如需保留现有课表，请先「导出课表」备份）')) return;
  data.timetable = parsed.list;
  persist();
  renderTimetableList();
  closeTtForm();
  render();
  toast('已导入 ' + parsed.list.length + ' 门课程');
}

async function exportTimetable() {
  const tt = Array.isArray(data.timetable) ? data.timetable : [];
  if (!tt.length) { toast('当前课表为空，无内容可导出'); return; }
  const r = await window.api.saveFileDialog('课表导出.xlsx');
  if (!r || !r.ok) return;
  const p = r.path;
  try {
    if (/\.xlsx$/i.test(p)) {
      const w = await window.api.writeXlsxTimetable(p, tt);
      if (w && w.ok) toast('已导出：' + p); else toast('导出失败：' + (w && w.msg ? w.msg : '未知错误'));
    } else if (/\.json$/i.test(p)) {
      const w = await window.api.writeTextFile(p, JSON.stringify(tt, null, 2));
      if (w && w.ok) toast('已导出：' + p); else toast('导出失败：' + (w && w.msg ? w.msg : '未知错误'));
    } else {
      const w = await window.api.writeTextFile(p, timetableToCSV(tt));
      if (w && w.ok) toast('已导出：' + p); else toast('导出失败：' + (w && w.msg ? w.msg : '未知错误'));
    }
  } catch (e) {
    toast('导出失败：' + e.message);
  }
}

/* ================= 持久化与通用 UI ================= */

function persist() {
  data.current = { year: state.year, semester: state.semester };
  window.api.saveData(JSON.stringify(data, null, 2));
}

let toastTimer = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 1800);
}

function eventInfo(sem, dateStr) {
  const raw = sem && sem.events ? sem.events[dateStr] : null;
  if (!raw) return null;
  if (raw.startsWith('~')) return { text: raw.slice(1), gray: true };
  return { text: raw, gray: false };
}

function isHoliday(sem, dateStr) {
  if (!sem || !sem.events) return false;
  const raw = sem.events[dateStr];
  if (!raw) return false;
  if (raw.startsWith('~')) return false;
  return /节$/.test(raw);
}

function dayKind(sem, dateStr, colIndex) {
  if (colIndex === undefined) {
    const d = fromISO(dateStr);
    colIndex = (d.getDay() + 6) % 7;
  }
  if (isHoliday(sem, dateStr)) return 'holiday';
  if (colIndex === 5 || colIndex === 6) return 'weekend';
  return 'workday';
}

function render() {
  syncToolbar();
  const v = state.view;
  const viewEl = document.getElementById('view');
  viewEl.classList.toggle('view-week', v.type === 'week');
  if (v.type === 'sem') renderSemester();
  else if (v.type === 'month') renderMonth(v.y, v.m);
  else if (v.type === 'week') renderWeek(v.monday);
  else renderToday();
}

function syncToolbar() {
  const sel = document.getElementById('yearSelect');
  const keys = Object.keys(data.years).sort();
  sel.innerHTML = keys.map(k => `<option value="${k}" ${k === state.year ? 'selected' : ''}>${k} 学年</option>`).join('')
    + '<option value="__new__">＋ 新建下一学年</option>';
  document.getElementById('btnSem1').classList.toggle('active', state.semester === '1');
  document.getElementById('btnSem2').classList.toggle('active', state.semester === '2');
  const t = state.view.type;
  document.getElementById('btnViewSem').classList.toggle('active', t === 'sem');
  document.getElementById('btnViewMonth').classList.toggle('active', t === 'month');
  document.getElementById('btnViewWeek').classList.toggle('active', t === 'week');
  document.getElementById('btnViewToday').classList.toggle('active', t === 'today');
}

function dotsHtml(dateStr) {
  const todos = todosOf(dateStr);
  if (!todos.length) return '';
  const dots = todos.slice(0, 4).map(t => `<span class="d-dot ${t.done ? 'done' : ''} ${t.isCourse ? 'course' : ''}"></span>`).join('');
  return `<div class="d-dots">${dots}</div>`;
}

function renderSemester() {
  const sem = currentSem();
  const el = document.getElementById('view');
  if (!sem) { el.innerHTML = '<div class="view-subtitle">当前学年数据不存在</div>'; return; }
  const weeks = buildWeeks(sem);
  const tISO = todayISO();

  let html = `<div class="view-title">${esc(state.year)}学年${esc(sem.name)}校历</div>`;
  html += `<div class="view-subtitle">点击日期可添加待办 · 点击周次列头可放大查看该周</div>`;

  html += `<div class="sem-group"><table><thead><tr>`;
  html += `<th class="week-head week-col-head">周次</th>`;
  WEEK_DOW.forEach((d, i) => {
    const cls = (i === 5 || i === 6) ? 'week-head weekend' : 'week-head';
    html += `<th class="${cls}">星期${d}</th>`;
  });
  if (sem.vacationLabel) html += `<th class="week-col-head vacation-head"><div class="wk-name">假期</div></th>`;
  html += `</tr></thead><tbody>`;
  weeks.forEach((w, wi) => {
    const isLast = wi === weeks.length - 1;
    html += `<tr>`;
    html += `<th class="week-col-head week-row-head" data-action="open-week" data-monday="${w.monday}">
      <div class="wk-name">${esc(w.name)}</div></th>`;
    for (let c = 0; c < 7; c++) {
      const ds = iso(addDays(fromISO(w.monday), c));
      const ev = eventInfo(sem, ds);
      const isToday = ds === tISO;
      const kind = dayKind(sem, ds, c);
      const cls = ['day-cell', kind, isToday ? 'today' : ''].filter(Boolean).join(' ');
      html += `<td class="${cls}" data-action="open-day" data-date="${ds}">
        <div class="d-num">${shortDate(ds)}</div>
        ${ev ? `<div class="d-event ${ev.gray ? 'gray' : ''}">${esc(ev.text)}</div>` : ''}
        ${dotsHtml(ds)}</td>`;
    }
    if (sem.vacationLabel && isLast) {
      html += `<td class="vacation-col" rowspan="${weeks.length}"><div class="vac-text">${esc(sem.vacationLabel)}</div></td>`;
    }
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;

  if (sem.notes && sem.notes.length) {
    html += `<div class="notes-panel"><div class="note-title">备注</div>${sem.notes.map(n => esc(n)).join('<br>')}</div>`;
  }
  el.innerHTML = html;
}

function renderMonth(y, m) {
  const el = document.getElementById('view');
  const sem = currentSem();
  const tISO = todayISO();
  const first = new Date(y, m - 1, 1);
  const gridStart = mondayOf(first);
  let html = `<div class="nav-row">
    <button class="btn" data-action="prev-month">◀ 上月</button>
    <div class="nav-title">${y} 年 ${m} 月</div>
    <button class="btn" data-action="next-month">下月 ▶</button>
  </div>`;
  html += `<div class="view-subtitle">点击日期添加待办 · 周末与节假日以暖色背景区分</div>`;
  html += `<table class="month-grid"><colgroup><col><col><col><col><col><col><col></colgroup><thead><tr>`;
  WEEK_DOW.forEach((d, c) => {
    let headCls = '';
    if (c === 5 || c === 6) headCls = 'weekend';
    html += `<th class="${headCls}">星期${d}</th>`;
  });
  html += `</tr></thead><tbody>`;
  for (let r = 0; r < 6; r++) {
    html += '<tr>';
    for (let c = 0; c < 7; c++) {
      const d = addDays(gridStart, r * 7 + c);
      const ds = iso(d);
      const inMonth = d.getMonth() === m - 1;
      if (!inMonth) { html += '<td class="empty"></td>'; continue; }
      const ev = eventInfo(sem, ds);
      const tag = weekTag(sem, ds);
      const kind = dayKind(sem, ds, c);
      const todos = todosOf(ds);
      let todosHtml = '';
      if (todos.length) {
        const shown = todos.slice(0, 2).map(t => `<div class="m-todo ${t.done ? 'done' : ''} ${t.isCourse ? 'course' : ''}">${esc(t.text)}</div>`).join('');
        const more = todos.length > 2 ? `<div class="m-more">还有 ${todos.length - 2} 项…</div>` : '';
        todosHtml = `<div class="m-todos">${shown}${more}</div>`;
      }
      const cls = [kind, ds === tISO ? 'today' : ''].filter(Boolean).join(' ');
      html += `<td class="${cls}" data-action="open-day" data-date="${ds}">
        <div class="m-head"><span class="m-num">${d.getDate()}</span>
        ${tag ? `<span class="m-weektag" data-action="open-week" data-monday="${iso(mondayOf(d))}">${esc(tag)}</span>` : ''}</div>
        ${ev ? `<div class="m-event ${ev.gray ? 'gray' : ''}">${esc(ev.text)}</div>` : ''}
        ${todosHtml}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderWeek(mondayStr) {
  const el = document.getElementById('view');
  const sem = currentSem();
  const tISO = todayISO();
  const mon = fromISO(mondayStr);
  const sun = addDays(mon, 6);
  const w = sem ? weekOfDate(sem, mondayStr) : null;
  const range = cnShort(iso(mon)) + ' — ' + cnShort(iso(sun));
  let html = `<div class="week-wrap">`;
  html += `<div class="nav-row">
    <button class="btn" data-action="prev-week">◀ 上周</button>
    <div class="nav-title">${range}${w ? ' · ' + esc(w.name) : ''}</div>
    <button class="btn" data-action="next-week">下周 ▶</button>
  </div>`;
  html += `<div class="week-cards">`;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i);
    const ds = iso(d);
    const ev = eventInfo(sem, ds);
    const todos = todosOf(ds);
    const kind = dayKind(sem, ds, i);
    const cls = ['week-card', kind, ds === tISO ? 'today' : ''].filter(Boolean).join(' ');
    html += `<div class="${cls}">
      <div class="wc-head" data-date="${ds}" title="双击添加当日待办">
        <div class="wc-dow">星期${WEEK_DOW[i]}</div>
        <div class="wc-date">${cnShort(ds)}</div>
      </div>
      <div class="wc-add hidden">
        <input type="text" placeholder="输入待办，回车添加…" data-addinput="${ds}">
        <button class="btn btn-primary" data-action="add-todo" data-date="${ds}" title="添加">＋</button>
      </div>
      ${ev ? `<div class="wc-event ${ev.gray ? 'gray' : ''}">${esc(ev.text)}</div>` : ''}
      <div class="wc-todos">`;
    if (todos.length) {
      html += todos.map(t => `<div class="wc-todo ${t.done ? 'done' : ''} ${t.isCourse ? 'course' : ''}">
        <input type="checkbox" ${t.done ? 'checked' : ''} ${t.isCourse ? 'disabled' : ''} data-action="toggle-todo" data-date="${ds}" data-id="${t.id}">
        <span class="t-text">${esc(t.text)}</span>
        ${t.isCourse ? '' : `<button class="t-del" data-action="del-todo" data-date="${ds}" data-id="${t.id}" title="删除">✕</button>`}
      </div>`).join('');
    } else {
      html += `<div class="wc-empty">暂无待办</div>`;
    }
    html += `</div>
    </div>`;
  }
  html += `</div>`;
  html += `<div class="week-hint">💡 双击星期几表头可添加当日待办</div>`;
  html += `</div>`;
  el.innerHTML = html;
}

function renderToday() {
  const el = document.getElementById('view');
  const sem = currentSem();
  const tISO = todayISO();
  const d = fromISO(tISO);
  const dow = (d.getDay() + 6) % 7;
  const w = sem ? weekOfDate(sem, tISO) : null;
  const ev = eventInfo(sem, tISO);
  const kind = dayKind(sem, tISO, dow);
  const courses = coursesRawForDate(tISO);
  const userTodos = (data.todos[tISO] || []).slice();
  const weekText = w ? (esc(state.year) + '学年' + esc(sem.name) + ' · ' + esc(w.name)) : '学期外时间（假期）';

  let html = `<div class="nav-row"><div class="nav-title">今天 · ${cnDate(tISO)} 星期${WEEK_DOW[dow]}</div></div>`;
  html += `<div class="view-subtitle">${weekText} · 今天的课程与待办一览</div>`;
  if (ev) html += `<div class="today-event ${ev.gray ? 'gray' : ''}">📌 ${esc(ev.text)}</div>`;
  html += `<div class="today-grid">`;

  html += `<section class="today-card ${kind}">
    <div class="tc-head"><span>📚 今日课程</span><span class="tc-count">${courses.length} 门</span></div>
    <div class="tc-body">`;
  if (courses.length) {
    html += courses.map(c => `<div class="today-course">
      <div class="c-time">${esc(c.time || '')}</div>
      <div class="c-main">
        <div class="c-name">${esc(c.course)}</div>
        <div class="c-meta">${[c.teacher, c.room].filter(Boolean).map(esc).join(' · ')}</div>
      </div>
      <span class="c-kind">${esc(c.weekKind || '每周')}</span>
    </div>`).join('');
  } else {
    html += `<div class="tc-empty">今天没有课程 🎉</div>`;
  }
  html += `</div>
  </section>`;

  html += `<section class="today-card today-todos ${kind}">
    <div class="tc-head"><span>✅ 待办 / 日程</span><span class="tc-count">${userTodos.length} 项</span></div>
    <div class="tc-body">`;
  if (userTodos.length) {
    html += userTodos.map(t => `<div class="wc-todo ${t.done ? 'done' : ''}">
      <input type="checkbox" ${t.done ? 'checked' : ''} data-action="toggle-todo" data-date="${tISO}" data-id="${t.id}">
      <span class="t-text">${esc(t.text)}</span>
      <button class="t-del" data-action="del-todo" data-date="${tISO}" data-id="${t.id}" title="删除">✕</button>
    </div>`).join('');
  } else {
    html += `<div class="tc-empty">今天还没有待办，添加一条吧</div>`;
  }
  html += `</div>
    <div class="tc-add">
      <input type="text" placeholder="输入今天的待办，回车添加…" data-addinput="${tISO}">
      <button class="btn btn-primary" data-action="add-todo" data-date="${tISO}" title="添加">＋</button>
    </div>
  </section>`;

  html += `</div>`;
  el.innerHTML = html;
}

let modalDate = null;

function openTodoModal(dateStr) {
  modalDate = dateStr;
  const sem = currentSem();
  const d = fromISO(dateStr);
  document.getElementById('todoDateTitle').textContent = cnDate(dateStr) + ' 星期' + WEEK_DOW[(d.getDay() + 6) % 7];
  const w = sem ? weekOfDate(sem, dateStr) : null;
  document.getElementById('todoWeekInfo').textContent = w ? esc(state.year) + '学年' + esc(sem.name) + ' · ' + w.name : '学期外时间';
  const ev = eventInfo(sem, dateStr);
  const bar = document.getElementById('todoEventBar');
  if (ev) {
    bar.textContent = '📌 ' + ev.text;
    bar.classList.remove('hidden');
    bar.classList.toggle('gray', ev.gray);
  } else {
    bar.classList.add('hidden');
  }
  renderTodoList();
  document.getElementById('todoModal').classList.remove('hidden');
  const input = document.getElementById('todoInput');
  input.value = '';
  setTimeout(() => input.focus(), 50);
}

function renderTodoList() {
  const ul = document.getElementById('todoList');
  const todos = todosOf(modalDate);
  if (!todos.length) {
    ul.innerHTML = '<li class="empty-tip">这一天还没有待办事项</li>';
    return;
  }
  ul.innerHTML = todos.map(t => `<li class="${t.done ? 'done' : ''} ${t.isCourse ? 'course' : ''}">
    <input type="checkbox" ${t.done ? 'checked' : ''} ${t.isCourse ? 'disabled' : ''} data-action="toggle-todo" data-date="${modalDate}" data-id="${t.id}">
    <span class="t-text">${esc(t.text)}</span>
    ${t.isCourse ? '' : `<button class="t-del" data-action="del-todo" data-date="${modalDate}" data-id="${t.id}" title="删除">✕</button>`}
  </li>`).join('');
}

function addTodo(dateStr, text) {
  text = text.trim();
  if (!text) return;
  if (!data.todos[dateStr]) data.todos[dateStr] = [];
  data.todos[dateStr].push({ id: 't' + Date.now() + Math.floor(Math.random() * 1000), text, done: false });
  persist();
}

function toggleTodo(dateStr, id) {
  const t = (data.todos[dateStr] || []).find(x => x.id === id);
  if (t) { t.done = !t.done; persist(); }
}

function deleteTodo(dateStr, id) {
  if (data.todos[dateStr]) {
    data.todos[dateStr] = data.todos[dateStr].filter(x => x.id !== id);
    if (!data.todos[dateStr].length) delete data.todos[dateStr];
    persist();
  }
}

function reopenAddInput(dateStr) {
  const inp = document.querySelector(`input[data-addinput="${dateStr}"]`);
  if (!inp) return;
  const box = inp.closest('.wc-add');
  if (box) box.classList.remove('hidden');
  inp.value = '';
  inp.focus();
}

function openSettings() {
  const sem = currentSem();
  if (!sem) return;
  document.getElementById('settingsTitle').textContent = '校历设置 — ' + state.year + '学年' + sem.name;
  document.getElementById('setPrepMonday').value = sem.prepMonday;
  document.getElementById('setClassWeeks').value = sem.classWeeks;
  document.getElementById('setExamWeeks').value = sem.examWeeks;
  document.getElementById('setPrepLabel').value = sem.prepLabel;
  document.getElementById('setExamLabel').value = sem.examLabel;
  document.getElementById('setVacationLabel').value = sem.vacationLabel;
  const evLines = Object.keys(sem.events || {}).sort().map(k => {
    const v = sem.events[k];
    return k + ' ' + (v.startsWith('~') ? '~' + v.slice(1) : v);
  });
  document.getElementById('setEvents').value = evLines.join('\n');
  document.getElementById('setNotes').value = (sem.notes || []).join('\n');
  document.getElementById('setDesktopMode').checked = !!state.desktopMode;
  const op = Math.round((data.desktopOpacity || 0.85) * 100);
  document.getElementById('setOpacity').value = op;
  document.getElementById('opacityVal').textContent = op + '%';
  fillThemeSelect();
  closeTtForm();
  renderTimetableList();
  updateEvernoteUI();
  document.getElementById('settingsModal').classList.remove('hidden');
}

function saveSettings() {
  const sem = currentSem();
  if (!sem) return;
  const pm = document.getElementById('setPrepMonday').value;
  if (!pm) { toast('请选择开学准备周日期'); return; }
  sem.prepMonday = pm;
  sem.classWeeks = Math.max(1, Math.min(30, parseInt(document.getElementById('setClassWeeks').value) || 18));
  sem.examWeeks = Math.max(0, Math.min(4, parseInt(document.getElementById('setExamWeeks').value) || 0));
  sem.prepLabel = document.getElementById('setPrepLabel').value.trim() || '开学准备周';
  sem.examLabel = document.getElementById('setExamLabel').value.trim() || '考试与阅卷周';
  sem.vacationLabel = document.getElementById('setVacationLabel').value.trim() || '';
  const events = {};
  document.getElementById('setEvents').value.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    const m = line.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
    if (m) events[m[1]] = m[2].trim();
  });
  sem.events = events;
  sem.notes = document.getElementById('setNotes').value.split('\n').map(s => s.trim()).filter(Boolean);
  data.desktopOpacity = (parseInt(document.getElementById('setOpacity').value) || 85) / 100;
  applyOpacity(data.desktopOpacity);
  persist();
  document.getElementById('settingsModal').classList.add('hidden');
  render();
  toast('设置已保存');
}

async function updateEvernoteUI() {
  const enState = await window.api.evernoteGetState();
  const statusEl = document.getElementById('evernoteStatus');
  const connectBtn = document.getElementById('enConnect');
  const disconnectBtn = document.getElementById('enDisconnect');
  const tokenInput = document.getElementById('enToken');
  const urlInput = document.getElementById('enNoteStoreUrl');
  const conflictLog = document.getElementById('enConflictLog');
  const conflictList = document.getElementById('enConflictList');

  if (enState && enState.connected) {
    statusEl.textContent = '已连接';
    statusEl.className = 'status-pill connected';
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';
    tokenInput.value = enState.token ? '••••••••' : '';
    urlInput.value = enState.noteStoreUrl || '';
    tokenInput.disabled = true;
    urlInput.disabled = true;

    if (enState.conflictLog && enState.conflictLog.length > 0) {
      conflictLog.classList.remove('hidden');
      const recent = enState.conflictLog.slice(-20).reverse();
      conflictList.innerHTML = recent.map(c => {
        const d = c.dateStr;
        return `<div class="en-conflict-item">
          <span class="en-date">${d}</span><br>
          本地：<span class="en-local">${esc(c.local.text)}</span>（${c.local.done ? '完成' : '未完成'}）<br>
          远程：<span class="en-remote">${esc(c.remote.text)}</span>（${c.remote.done ? '完成' : '未完成'}）
        </div>`;
      }).join('');
    } else {
      conflictLog.classList.add('hidden');
    }
  } else {
    statusEl.textContent = '未连接';
    statusEl.className = 'status-pill';
    connectBtn.style.display = 'inline-block';
    disconnectBtn.style.display = 'none';
    tokenInput.value = '';
    urlInput.value = '';
    tokenInput.disabled = false;
    urlInput.disabled = false;
    conflictLog.classList.add('hidden');
  }
}

function nextYearKey(key) {
  const p = key.split('-').map(Number);
  return (p[0] + 1) + '-' + (p[1] + 1);
}

function createNextYear() {
  const nk = nextYearKey(state.year);
  if (data.years[nk]) { toast(nk + ' 学年已存在'); return; }
  const cur = data.years[state.year];
  const p = state.year.split('-').map(Number);
  const sem1 = clone(cur['1'] || {});
  sem1.name = '第一学期';
  sem1.prepMonday = iso(mondayOf(new Date(p[0] + 1, 8, 1)));
  sem1.events = {};
  sem1.notes = [];
  const sem2 = clone(cur['2'] || {});
  sem2.name = '第二学期';
  sem2.prepMonday = iso(mondayOf(new Date(p[1] + 1, 2, 1)));
  sem2.events = {};
  sem2.notes = [];
  data.years[nk] = { '1': sem1, '2': sem2 };
  state.year = nk;
  state.semester = '1';
  state.view = { type: 'sem' };
  persist();
  render();
  toast('已创建 ' + nk + ' 学年，请在“校历设置”中调整日期、事件与备注');
}

function bindEvents() {
  document.getElementById('yearSelect').addEventListener('change', e => {
    if (e.target.value === '__new__') {
      createNextYear();
      syncToolbar();
      return;
    }
    state.year = e.target.value;
    if (!currentYearObj() || !currentYearObj()[state.semester]) state.semester = '1';
    state.view = { type: 'sem' };
    persist();
    render();
  });

  document.getElementById('themeSelect').addEventListener('change', e => {
    data.theme = e.target.value;
    applyTheme(data.theme);
    persist();
    toast('皮肤已切换：' + e.target.selectedOptions[0].text);
  });

  document.getElementById('btnSem1').addEventListener('click', () => { state.semester = '1'; persist(); render(); });
  document.getElementById('btnSem2').addEventListener('click', () => { state.semester = '2'; persist(); render(); });

  document.getElementById('btnViewSem').addEventListener('click', () => { state.view = { type: 'sem' }; render(); });
  document.getElementById('btnViewMonth').addEventListener('click', () => {
    const t = new Date();
    state.view = { type: 'month', y: t.getFullYear(), m: t.getMonth() + 1 };
    render();
  });
  document.getElementById('btnViewWeek').addEventListener('click', () => {
    state.view = { type: 'week', monday: iso(mondayOf(new Date())) };
    render();
  });
  document.getElementById('btnViewToday').addEventListener('click', () => {
    state.view = { type: 'today' };
    render();
  });

  document.getElementById('btnSettings').addEventListener('click', openSettings);

  document.getElementById('view').addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const act = target.dataset.action;
    if (act === 'open-day') { openTodoModal(target.dataset.date); return; }
    if (act === 'open-week') {
      e.stopPropagation();
      state.view = { type: 'week', monday: target.dataset.monday };
      render();
      return;
    }
    if (act === 'prev-month' || act === 'next-month') {
      let { y, m } = state.view;
      m += act === 'prev-month' ? -1 : 1;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      state.view = { type: 'month', y, m };
      render();
      return;
    }
    if (act === 'prev-week' || act === 'next-week') {
      const delta = act === 'prev-week' ? -7 : 7;
      state.view = { type: 'week', monday: iso(addDays(fromISO(state.view.monday), delta)) };
      render();
      return;
    }
    if (act === 'add-todo') {
      const dateStr = target.dataset.date;
      const wrap = target.closest('.wc-add') || target.closest('.tc-add');
      const input = wrap ? wrap.querySelector('input') : document.querySelector(`input[data-addinput="${dateStr}"]`);
      if (input && input.value.trim()) {
        addTodo(dateStr, input.value);
        render();
        reopenAddInput(dateStr);
      }
      return;
    }
    if (act === 'toggle-todo') {
      toggleTodo(target.dataset.date, target.dataset.id);
      render();
      return;
    }
    if (act === 'del-todo') {
      deleteTodo(target.dataset.date, target.dataset.id);
      render();
      return;
    }
  });

  /* 周视图：双击表头显示添加待办输入框 */
  document.getElementById('view').addEventListener('dblclick', e => {
    const head = e.target.closest('.wc-head');
    if (!head || !head.dataset.date) return;
    const card = head.closest('.week-card');
    const add = card ? card.querySelector('.wc-add') : null;
    if (add) {
      add.classList.remove('hidden');
      const inp = add.querySelector('input');
      if (inp) inp.focus();
    }
  });

  /* 输入框失焦后自动收起（周视图） */
  document.getElementById('view').addEventListener('focusout', e => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement) || !t.dataset.addinput) return;
    const box = t.closest('.wc-add');
    if (!box) return;
    setTimeout(() => {
      if (!box.contains(document.activeElement)) box.classList.add('hidden');
    }, 160);
  });

  document.getElementById('view').addEventListener('keydown', e => {
    if (e.target.dataset && e.target.dataset.addinput) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const dateStr = e.target.dataset.addinput;
        if (e.target.value.trim()) {
          addTodo(dateStr, e.target.value);
          render();
          reopenAddInput(dateStr);
        }
        return;
      }
      if (e.key === 'Escape') {
        const box = e.target.closest('.wc-add');
        if (box) {
          box.classList.add('hidden');
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  });

  document.getElementById('todoAddBtn').addEventListener('click', () => {
    const input = document.getElementById('todoInput');
    if (input.value.trim()) {
      addTodo(modalDate, input.value);
      input.value = '';
      renderTodoList();
      render();
    }
  });

  document.getElementById('todoInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addTodo(modalDate, e.target.value);
      e.target.value = '';
      renderTodoList();
      render();
    }
  });

  document.getElementById('setOpacity').addEventListener('input', e => {
    const v = parseInt(e.target.value) || 85;
    document.getElementById('opacityVal').textContent = v + '%';
    applyOpacity(v / 100);
  });

  document.getElementById('setDesktopMode').addEventListener('change', e => {
    data.desktopOpacity = (parseInt(document.getElementById('setOpacity').value) || 85) / 100;
    persist();
    window.api.setDesktopMode(e.target.checked);
  });

  /* 课表管理 */
  document.getElementById('ttAdd').addEventListener('click', () => openTtForm());
  document.getElementById('ttImport').addEventListener('click', importTimetable);
  document.getElementById('ttExport').addEventListener('click', exportTimetable);
  document.getElementById('ttOpenFolder').addEventListener('click', async () => {
    const p = await window.api.openDataFolder();
    if (p) toast('已打开数据文件夹');
  });
  document.getElementById('ttSave').addEventListener('click', saveTtForm);
  document.getElementById('ttCancel').addEventListener('click', closeTtForm);
  document.getElementById('ttList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-tt-edit],button[data-tt-del]');
    if (!btn) return;
    if (btn.dataset.ttEdit !== undefined) openTtForm(Number(btn.dataset.ttEdit));
    else if (btn.dataset.ttDel !== undefined) deleteTtRow(Number(btn.dataset.ttDel));
  });

  document.getElementById('enGetToken').addEventListener('click', () => {
    window.open('https://app.yinxiang.com/api/DeveloperToken.action', '_blank');
  });

  document.getElementById('enConnect').addEventListener('click', async () => {
    const token = document.getElementById('enToken').value.trim();
    const noteStoreUrl = document.getElementById('enNoteStoreUrl').value.trim();
    if (!token) { toast('请输入开发者 Token'); return; }
    if (!noteStoreUrl) { toast('请输入 NoteStore URL'); return; }
    const result = await window.api.evernoteSetToken(token, noteStoreUrl);
    if (result.ok) {
      if (result.state) data.evernote = result.state;
      updateEvernoteUI();
      toast('已连接印象笔记');
    } else {
      toast('连接失败：' + result.msg);
    }
  });

  document.getElementById('enDisconnect').addEventListener('click', async () => {
    const result = await window.api.evernoteClearToken();
    if (result.ok) {
      if (result.state) data.evernote = result.state;
      updateEvernoteUI();
      toast('已断开印象笔记连接');
    }
  });

  document.getElementById('enTestConn').addEventListener('click', async () => {
    const token = document.getElementById('enToken').value.trim();
    const noteStoreUrl = document.getElementById('enNoteStoreUrl').value.trim();
    if (!token || !noteStoreUrl) {
      const enState = await window.api.evernoteGetState();
      if (!enState || !enState.token || !enState.noteStoreUrl) {
        toast('请先填写 Token 和 NoteStore URL');
        return;
      }
    }
    toast('正在测试连接…');
    const result = await window.api.evernoteTestConnection();
    if (result.ok) {
      const r = result.result;
      toast('连接成功！找到 ' + r.notebookCount + ' 个笔记本');
    } else {
      toast('连接失败：' + result.msg);
    }
  });

  document.getElementById('enFullSync').addEventListener('click', async () => {
    toast('正在同步…首次推送可能需要几秒到十几秒');
    const result = await window.api.evernoteFullSync();
    if (result.ok) {
      const r = result.result;
      if (result.state) data.evernote = result.state;
      if (r.todosByDate) {
        for (const dateStr in r.todosByDate) {
          data.todos[dateStr] = r.todosByDate[dateStr];
        }
        persist();
      }
      const raw = r.rawCount || 0;
      const valid = r.validCount || 0;
      const merged = r.total || 0;
      const detail = (raw !== valid || raw === 0)
        ? '（印象笔记搜索到 ' + raw + ' 条，过滤后 ' + valid + ' 条）'
        : '';
      toast('同步完成：推送 ' + (r.pushTotal || 0) + ' 天 → 拉取 ' + merged + ' 天' + detail);
      render();
    } else {
      toast('同步失败：' + result.msg);
    }
  });

  document.getElementById('todoPushToEvernote').addEventListener('click', async () => {
    if (!modalDate) return;
    const todos = todosOf(modalDate);
    const result = await window.api.evernotePushDate(modalDate, todos);
    if (result.ok) {
      if (result.state) data.evernote = result.state;
      toast('已推送到印象笔记（' + result.result.action + '）');
    } else {
      toast('推送失败：' + result.msg);
    }
  });

  document.getElementById('todoPullFromEvernote').addEventListener('click', async () => {
    if (!modalDate) return;
    const result = await window.api.evernotePullDate(modalDate);
    if (result.ok && result.result) {
      data.todos[modalDate] = result.result.todos;
      if (result.state) data.evernote = result.state;
      persist();
      renderTodoList();
      render();
      toast('已从印象笔记拉取 ' + result.result.todos.length + ' 项');
    } else if (result.ok && !result.result) {
      if (result.state) data.evernote = result.state;
      toast('印象笔记中没有该日期的待办');
    } else {
      toast('拉取失败：' + result.msg);
    }
  });

  document.getElementById('settingsSave').addEventListener('click', saveSettings);
  document.getElementById('settingsCancel').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('hidden');
  });
  document.getElementById('settingsReset').addEventListener('click', () => {
    if (confirm('确定要恢复默认校历数据吗？所有学年数据与待办事项都将被重置。')) {
      data = defaultData();
      state.year = data.current.year;
      state.semester = data.current.semester;
      state.view = { type: 'sem' };
      persist();
      document.getElementById('settingsModal').classList.add('hidden');
      render();
      toast('已恢复默认数据');
    }
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target.dataset && e.target.dataset.close) modal.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }
  });

  document.getElementById('btnQuit').addEventListener('click', () => {
    if (confirm('确定要退出桌面校历吗？')) {
      window.api.quit();
    }
  });
}

async function init() {
  const raw = await window.api.loadData();
  if (raw) {
    try { data = JSON.parse(raw); } catch (e) { data = defaultData(); }
  } else {
    data = defaultData();
  }
  if (!data || !data.years) data = defaultData();
  if (!data.theme) data.theme = 'classic';
  if (!Array.isArray(data.timetable)) {
    data.timetable = TIMETABLE_DEFAULT;
    persist();
  }
  applyTheme(data.theme);
  applyOpacity(data.desktopOpacity || 0.85);
  try {
    state.desktopMode = await window.api.isDesktopMode();
  } catch (e) { state.desktopMode = false; }
  document.body.classList.toggle('desktop-mode', !!state.desktopMode);
  state.year = data.current.year in data.years ? data.current.year : Object.keys(data.years).sort()[0];
  state.semester = data.current.semester || '1';
  state.view = { type: 'sem' };
  bindEvents();
  updateEvernoteUI();
  render();
}

init();
