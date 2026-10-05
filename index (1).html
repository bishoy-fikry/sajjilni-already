<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sajjilni | سجلني</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#f6f4ef;--card:#fff;--tx:#2a2420;--mu:#7a6f66;--ac:#8a2432;--ac2:#f3e3e5;--bd:#e3ddd3;--ok:#1f7a4d;--no:#b3261e;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#1c1917;--card:#292524;--tx:#f1ece6;--mu:#a8a098;--ac:#e07a88;--ac2:#3a2a2d;--bd:#403a36;--ok:#4cc38a;--no:#f07b72}}
:root[data-theme="dark"]{--bg:#1c1917;--card:#292524;--tx:#f1ece6;--mu:#a8a098;--ac:#e07a88;--ac2:#3a2a2d;--bd:#403a36;--ok:#4cc38a;--no:#f07b72}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font-family:'Cairo',Tahoma,sans-serif;line-height:1.6}
.w{max-width:860px;margin:0 auto;padding:16px}
header{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.logo{font-weight:700;font-size:22px;color:var(--ac)}.logo small{color:var(--mu);font-weight:400;font-size:13px;margin-inline-start:6px}
.c{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px;margin-bottom:12px}
h2{margin:0 0 10px;font-size:19px}
input,select,textarea{width:100%;padding:10px;margin:4px 0 10px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--tx);font:inherit}
label{font-size:13px;color:var(--mu)}
button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:9px 14px;background:var(--ac);color:#fff}
button.g{background:var(--ac2);color:var(--ac)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.grid button{padding:16px 8px;background:var(--card);color:var(--tx);border:1px solid var(--bd)}
.grid button.me{border-color:var(--ac);background:var(--ac2)}
.tabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px}
.tabs button{background:var(--card);color:var(--tx);border:1px solid var(--bd);white-space:nowrap}
.tabs button.on{background:var(--ac);color:#fff}
.row{display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid var(--bd);padding:10px 0;flex-wrap:wrap}
.row:last-child{border:0}.mu{color:var(--mu);font-size:13px}
.y{background:var(--ok)}.n{background:var(--no)}.off{opacity:.35}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:520px){.two{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="w" id="app"></div>
<script>
const SEC={'تربية كنسية':['حضانة','أولى وثانية','ثالثة ورابعة','خامسة وسادسة','أولى إعدادي','ثانية إعدادي','ثالثة إعدادي','أولى ثانوي','ثانية ثانوي','ثالثة ثانوي'],
'مدرسة شمامسة':['حضانة','أولى وثانية','ثالثة ورابعة','خامسة وسادسة','أولى إعدادي','ثانية إعدادي','ثالثة إعدادي','أولى ثانوي','ثانية ثانوي','ثالثة ثانوي'],
'اجتماعات عامة':['شباب','الاجتماع العام','اجتماع سيدات','اجتماع رجال','الكشافة','اجتماع الخدام']};
const ROLES=['خادم','أمين خدمة','مسئول خدمة','مسئول قطاع'];
const WIDE=['مسئول خدمة','مسئول قطاع'];
const T=[['sa','حضور المخدومين'],['ta','حضور الخدام'],['served','تسجيل المخدومين'],['servant','تسجيل الخدام']];
const mem={};
const L=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return mem[k]??d}};
const S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){mem[k]=v}};
let users=L('sj_users',[]),people=L('sj_people',[]),att=L('sj_att',{});
let me=L('sj_me',null);
let s={page:me?'home':'auth',mode:'login',tab:'sa',edit:null,add:false,date:new Date().toISOString().slice(0,10)};
const $=i=>document.getElementById(i);
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hash=t=>btoa(unescape(encodeURIComponent(t)));
const cur=()=>users.find(u=>u.phone===me);
const can=(u,k)=>{const[sec,st]=k.split('|');return WIDE.includes(u.role)?u.section===sec:(u.section===sec&&u.stage===st)};
const opt=a=>a.map(x=>`<option>${x}</option>`).join('');

function go(page,o={}){Object.assign(s,{page,edit:null,add:false},o);draw()}
function draw(){const u=me&&cur();if(me&&!u){me=null;S('sj_me',null);s.page='auth'}
let h=`<header><div class="logo">Sajjilni<small>سجلني</small></div>`;
if(u)h+=`<div class="mu">${esc(u.name)} · ${u.role} · ${u.section}${WIDE.includes(u.role)?'':' / '+u.stage}
<button class="g" onclick="logout()">خروج</button></div>`;
h+='</header>';
if(s.page=='auth')h+=auth();else if(u.locked)h+=lockedView();else if(s.page=='home')h+=home(u);else if(s.page=='section')h+=section(u);else h+=stage(u);
$('app').innerHTML=h;if(s.page=='auth'&&s.mode=='reg')fillStages()}

function auth(){const r=s.mode=='reg';
return `<div class="c"><div class="tabs"><button class="${r?'':'on'}" onclick="s.mode='login';draw()">دخول</button><button class="${r?'on':''}" onclick="s.mode='reg';draw()">حساب خادم جديد</button></div>
${r?`<label>الاسم</label><input id="an">`:''}
<label>رقم الهاتف</label><input id="ap" type="tel" inputmode="tel">
<label>كلمة المرور</label><input id="aw" type="password">
${r?`<div class="two"><div><label>الدور</label><select id="ar">${opt(ROLES)}</select></div>
<div><label>القطاع</label><select id="as" onchange="fillStages()">${opt(Object.keys(SEC))}</select></div></div>
<label>المرحلة المسئول عنها</label><select id="at"></select>`:''}
<button onclick="${r?'register()':'login()'}">${r?'تسجيل':'دخول'}</button>
<p class="mu">${r?'ستدخل فقط على بيانات المرحلة المسئول عنها.':''}</p></div>`}
function fillStages(){const a=$('as'),t=$('at');if(a&&t)t.innerHTML=opt(SEC[a.value])}
function register(){const n=$('an').value.trim(),p=$('ap').value.trim(),w=$('aw').value;
if(!n||!p||w.length<4)return alert('اكتب الاسم والهاتف وكلمة مرور (4 أحرف على الأقل)');
if(users.some(u=>u.phone===p))return alert('هذا الرقم مسجل من قبل');
users.push({name:n,phone:p,pw:hash(w),role:$('ar').value,section:$('as').value,stage:$('at').value,locked:false});
S('sj_users',users);me=p;S('sj_me',me);go('home')}
function login(){const p=$('ap').value.trim(),u=users.find(x=>x.phone===p);
if(!u||u.pw!==hash($('aw').value))return alert('الرقم أو كلمة المرور غير صحيحة');
me=p;S('sj_me',me);go('home')}
function logout(){me=null;S('sj_me',null);go('auth',{mode:'login'})}
function lockedView(){return `<div class="c"><h2>🔒 تم إغلاق الحساب</h2><p>تم إغلاق حسابك لمحاولة الدخول على مرحلة غير مسئول عنها. تواصل مع مسئول القطاع لإعادة فتحه.</p></div>`}

function home(u){let h=`<div class="c"><h2>اختر القطاع</h2><div class="grid">`+Object.keys(SEC).map(k=>`<button class="${u.section==k?'me':''}" onclick="go('section',{sec:'${k}'})">${k}</button>`).join('')+'</div></div>';
if(u.role=='مسئول قطاع'){const lk=users.filter(x=>x.locked);
h+=`<div class="c"><h2>الحسابات المغلقة</h2>`+(lk.length?lk.map(x=>`<div class="row"><span>${esc(x.name)} <span class="mu">${esc(x.phone)} · ${x.section} / ${x.stage}</span></span><button onclick="unlock('${esc(x.phone)}')">فتح</button></div>`).join(''):'<p class="mu">لا توجد حسابات مغلقة</p>')+'</div>'}
return h}
function unlock(p){const x=users.find(u=>u.phone===p);if(x){x.locked=false;S('sj_users',users);draw()}}
function section(u){return `<div class="c"><button class="g" onclick="go('home')">رجوع</button><h2 style="margin-top:10px">${s.sec}</h2><div class="grid">`+
SEC[s.sec].map(st=>{const k=s.sec+'|'+st,ok=can(u,k);return `<button class="${ok?'me':''}" onclick="openStage('${k}')">${ok?'':'🔒 '}${st}</button>`}).join('')+'</div></div>'}
function openStage(k){const u=cur();
if(!can(u,k)){u.locked=true;S('sj_users',users);alert('غير مسموح لك بهذه المرحلة. تم إغلاق حسابك.');return draw()}
go('stage',{key:k,tab:'sa'})}

function stage(u){const k=s.key,[sec,st]=k.split('|');
if(!can(u,k)){u.locked=true;S('sj_users',users);return lockedView()}
const kind=(s.tab=='served'||s.tab=='sa')?'served':'servant';
let h=`<button class="g" onclick="go('section',{sec:'${sec}'})">رجوع</button><h2 style="margin:10px 0">${sec} — ${st}</h2><div class="tabs">`+
T.map(([i,t])=>`<button class="${s.tab==i?'on':''}" onclick="s.tab='${i}';s.edit=null;s.add=false;draw()">${t}</button>`).join('')+'</div>';
const list=people.filter(p=>p.key==k&&p.kind==kind);
if(s.tab=='sa'||s.tab=='ta'){const cnt=v=>list.filter(p=>att[s.date+'|'+p.id]===v).length;
h+=`<div class="c"><label>التاريخ</label><input type="date" value="${s.date}" onchange="s.date=this.value;draw()">
<p class="mu">حاضر: ${cnt(1)} · غائب: ${cnt(0)} · لم يسجل: ${list.length-cnt(1)-cnt(0)}</p>
${list.length?`<button class="g" onclick="markAll(1)">تحديد الكل حاضر</button> <button class="g" onclick="markAll(0)">تحديد الكل غائب</button>`:''}`+
(list.length?list.map(p=>{const v=att[s.date+'|'+p.id];return `<div class="row"><span>${esc(p.name)}</span><span><button class="y ${v===1?'':'off'}" onclick="mark('${p.id}',1)">حاضر</button> <button class="n ${v===0?'':'off'}" onclick="mark('${p.id}',0)">غائب</button></span></div>`}).join(''):'<p class="mu">لا توجد أسماء بعد. سجّل الأسماء أولا من خانة التسجيل.</p>')+'</div>';return h}
const e=people.find(p=>p.id==s.edit)||{};
if(!s.add&&!s.edit)h+=`<button onclick="s.add=true;draw()" style="margin-bottom:12px">+ إضافة ${kind=='served'?'مخدوم':'خادم'} جديد</button>`;
else h+=`<div class="c"><h2>${s.edit?'تعديل':'إضافة'} ${kind=='served'?'مخدوم':'خادم'}</h2><label>الاسم</label><input id="fn" value="${esc(e.name)}">
<div class="two"><div><label>رقم الهاتف</label><input id="fp" type="tel" value="${esc(e.phone)}"></div><div><label>تاريخ الميلاد</label><input id="fb" type="date" value="${esc(e.birth)}"></div></div>
<label>العنوان</label><input id="fa" value="${esc(e.addr)}"><label>ملاحظات</label><textarea id="fo" rows="2">${esc(e.notes)}</textarea>
<button onclick="save('${kind}')">حفظ</button> <button class="g" onclick="s.edit=null;s.add=false;draw()">إلغاء</button></div>`;
h+=`<div class="c"><h2>القائمة (${list.length})</h2>`+(list.length?list.map(p=>`<div class="row"><span><b>${esc(p.name)}</b><br><span class="mu">${esc(p.phone)} · ${esc(p.birth)} · ${esc(p.addr)}${p.notes?'<br>'+esc(p.notes):''}</span></span>
<span><button class="g" onclick="s.edit='${p.id}';draw();scrollTo(0,0)">تعديل</button> <button class="g" onclick="del('${p.id}')">حذف</button></span></div>`).join(''):'<p class="mu">القائمة فارغة</p>')+'</div>';
return h}
function save(kind){const g=i=>$(i).value.trim();if(!g('fn'))return alert('اكتب الاسم');
const o={name:g('fn'),phone:g('fp'),birth:g('fb'),addr:g('fa'),notes:g('fo')};
if(s.edit)Object.assign(people.find(p=>p.id==s.edit),o);else people.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),kind,key:s.key,...o});
S('sj_people',people);s.edit=null;s.add=false;draw()}
function del(id){if(!confirm('حذف هذا الاسم؟'))return;people=people.filter(p=>p.id!=id);S('sj_people',people);draw()}
function markAll(v){people.filter(p=>p.key==s.key&&p.kind==((s.tab=='sa')?'served':'servant')).forEach(p=>att[s.date+'|'+p.id]=v);S('sj_att',att);draw()}
function mark(id,v){att[s.date+'|'+id]=v;S('sj_att',att);draw()}
draw();
</script>
</body>
</html>
