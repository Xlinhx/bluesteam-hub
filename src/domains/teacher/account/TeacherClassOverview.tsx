import { useState, type ReactNode } from 'react';
import {
  Award, BookOpen, CalendarDays, Check, ChevronRight, ClipboardList, Gamepad2, Palette, Signpost, Users,
} from 'lucide-react';
import { profileBadgeCatalog, type ProfileRecord } from '@bluesteam/contracts';
import { ProfileSelect } from '../../../shared/ui/profile/ProfileFields';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatar';
import { ProfileRecordsDialog, type ProfileDialogRecord } from '../../../shared/ui/profile/ProfileRecordsDialog';
import { rosterDate, type Member } from './classroomProfileTypes';
import './teacher-overview.css';

type DatedRecord = { learner_id:string; at:string };
type ClassEvent = ProfileRecord & DatedRecord & { name:string; contentTitle?:string };
export type ClassOverviewEvidence = {
  timeline:ClassEvent[];
  resources?: (DatedRecord & {id:string;title:string})[];
  badges?: (DatedRecord & { badge_id:string; rule_version:number })[];
};

const art = '/assets/generated/profile/dive-log/';
const avatars = '/assets/generated/profile/teacher-3d/';
const month = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit'});
const monthOf = (item:DatedRecord) => month.format(new Date(item.at));
const number = new Intl.NumberFormat('vi-VN');
const icons = { explore:BookOpen, interact:Gamepad2, create:Palette };
const searchKey = (value:string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu,'').replaceAll('đ','d');
const creatureAvatars: Record<string,string> = {
  'rua bien':'turtle', 'ca heo':'dolphin', 'ca he':'clownfish', 'ca ngua':'seahorse',
  'sao bien':'starfish', 'bach tuoc':'octopus', 'ca map':'shark', 'ca voi':'whale',
};

function distinct<T extends {id:string}>(records:T[]) {
  const seen = new Set<string>();
  return records.filter(item=>{
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function CardAction({ children, label, onClick }: { children:ReactNode; label?:string; onClick:()=>void }) {
  return <button type="button" className="teacher-profile-action" aria-label={label} aria-haspopup="dialog" onClick={onClick}>
    {children}<ChevronRight aria-hidden="true"/>
  </button>;
}

function speciesAvatar(title:string) {
  const key = searchKey(title);
  const match = Object.keys(creatureAvatars).find(name=>key===name || key.startsWith(name+' '));
  return match ? avatars+'avatar-'+creatureAvatars[match]+'.webp' : undefined;
}

function PreviewArt({ item }: { item:ProfileDialogRecord }) {
  const Icon = icons[item.family];
  const avatar = item.family==='explore' ? speciesAvatar(item.title) : undefined;
  const src = item.learnerName ? item.image || avatar : avatar || item.image;
  return src ? <img src={src} alt="" decoding="async"/> : <Icon aria-hidden="true"/>;
}

export function TeacherClassOverview({ className, members, evidence }: {
  className:string; members:Member[]; evidence:ClassOverviewEvidence;
}) {
  const [student,setStudent] = useState('');
  const [period,setPeriod] = useState('');
  const [dialog,setDialog] = useState<'species'|'games'|'creations'|'journey'|'badges'>();
  const resources = evidence.resources ?? [];
  const badges = evidence.badges ?? [];
  const matches = (item:DatedRecord) => (!student || student===item.learner_id) && (!period || period===monthOf(item));
  const periods = [...new Set([...evidence.timeline,...resources,...badges].map(monthOf))].sort().reverse();
  const events = evidence.timeline.filter(matches);
  const records = (family:ProfileRecord['family']) => distinct(events.filter(item=>item.family===family)
    .map(item=>({...item,title:item.contentTitle || item.title})));
  const species = records('explore');
  const games = records('interact');
  const creations = records('create');
  const learningMaterials = distinct(resources.filter(matches));
  const learnerNames = new Map(members.map(member=>[member.learner_id,member.name]));
  const earned = badges.filter(matches).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).map((badge):ProfileDialogRecord=>{
    const rule = profileBadgeCatalog.find(rule=>rule.id===badge.badge_id);
    return {
      id: [badge.learner_id,badge.badge_id,badge.rule_version].join(':'),
      title: rule?.title ?? 'Huy hiệu '+badge.badge_id,
      family: rule?.family ?? 'explore',
      image: art+(rule?.artwork ?? 'teacher-medal.webp'),
      at: badge.at,
      learnerName: learnerNames.get(badge.learner_id) ?? 'Học sinh của lớp',
    };
  });
  const illustratedSpecies = distinct(species.flatMap(item=>{
    const image = speciesAvatar(item.title);
    return image ? [{id:image,item}] : [];
  })).map(value=>value.item);
  const previewSpecies = [...new Set([
    ...illustratedSpecies,...species.filter(item=>!speciesAvatar(item.title)),...species,
  ])].slice(0,3);
  const highlights = Object.keys(icons).map(family=>events.find(item=>item.family===family)).filter(Boolean);
  const chosen = new Set([...new Set([...highlights,...events])].slice(0,3));
  const recent = events.filter(item=>chosen.has(item)).reverse();
  const gameLearners = new Set(events.filter(item=>item.family==='interact').map(item=>item.learner_id)).size;
  const cohort = student ? 1 : members.length;
  const activityRows = events.map(item=>({
    ...item, title:item.contentTitle || item.title, learnerName:item.name,
  }));
  const detail = {
    badges:{ title:'Thành tích của các bé', records:earned, mode:'badges' },
    species:{ title:'Nội dung đã học', records:species, mode:'explore' },
    games:{ title:'Lượt chơi được ghi nhận', records:activityRows.filter(item=>item.family==='interact'), mode:'interact' },
    creations:{ title:'Sản phẩm đã tạo', records:activityRows.filter(item=>item.family==='create'), mode:'create' },
    journey:{ title:'Hành trình học tập', records:activityRows, mode:'timeline' },
  } as const;

  return <div className="teacher-class-overview">
    <header className="overview-heading">
      <h2>Hành trình lớp {className}<span className="overview-bubbles" aria-hidden="true"/></h2>
      <div className="overview-filters">
        <ProfileSelect label="Học sinh" value={student} onChange={setStudent} icon={<Users size={18} aria-hidden="true"/>}
          options={[{value:'',label:'Tất cả học sinh'},...members.map(member=>({value:member.learner_id,label:member.name,
            icon:<AnimalAvatar className="profile-option-avatar" avatarKey={member.avatar_key} alt=""/>}))]}/>
        <ProfileSelect label="Thời gian ghi nhận" value={period} onChange={setPeriod} icon={<CalendarDays size={18} aria-hidden="true"/>}
          options={[{value:'',label:'Mọi thời điểm'},...periods.map(value=>({value,label:`Tháng ${Number(value.slice(5))}/${value.slice(0,4)}`}))]}/>
      </div>
    </header>
    <div className="overview-summary">
      <section className="overview-card overview-progress" data-profile-card="progress">
        <h3><ClipboardList aria-hidden="true"/>Tiến trình học tập</h3>
        <div className="overview-progress-content">
          <img src={art+'notebook.webp'} alt="" decoding="async"/>
          <dl>
            <div><dt>Sinh vật đã ghi nhận</dt><dd>{number.format(species.length)}</dd></div>
            <div><dt>Học liệu đã mở</dt><dd>{number.format(learningMaterials.length)}</dd></div>
          </dl>
          <img src={art+'resource-cards.webp'} alt="" decoding="async"/>
        </div>
      </section>
      <section className="overview-card overview-achievements" data-profile-card="achievement">
        <h3><Award aria-hidden="true"/>Thành tích của các bé</h3>
        <img className="overview-card-art" src={art+'teacher-medal.webp'} alt=""/>
        <p className="overview-total"><strong>{number.format(earned.length)}</strong> huy hiệu đã đạt</p>
        <CardAction onClick={()=>setDialog('badges')}>Xem thành tích</CardAction>
      </section>
    </div>
    <div className="overview-collections">
      <section className="overview-card overview-species" data-profile-card="learned">
        <header className="overview-card-heading"><h3><BookOpen aria-hidden="true"/>Nội dung đã học</h3>
          <CardAction label="Xem tất cả nội dung đã học" onClick={()=>setDialog('species')}>Xem tất cả</CardAction></header>
        <p className="overview-total"><strong>{number.format(species.length)}</strong> sinh vật đã ghi vào sổ</p>
        {species.length ? <ul className="overview-species-list">{previewSpecies.map(item=><li key={item.id}>
          <PreviewArt item={item}/><span title={item.title}>{item.title}</span>
        </li>)}</ul> : <p className="overview-empty">Chưa có sinh vật được ghi vào sổ.</p>}
      </section>
      <section className="overview-card overview-games" data-profile-card="games">
        <header className="overview-card-heading"><h3><Gamepad2 aria-hidden="true"/>Game đã chơi</h3>
          <CardAction label="Xem tất cả lượt chơi" onClick={()=>setDialog('games')}>Xem tất cả</CardAction></header>
        <p className="overview-total"><strong>{number.format(games.length)}</strong> trò chơi</p>
        {games.length ? <>
          <ul className="overview-game-list">{games.slice(0,2).map(item=><li key={item.id}>
            <PreviewArt item={item}/><span>{item.title}</span>
          </li>)}</ul>
          <span className="overview-chip"><Check aria-hidden="true"/>{gameLearners}/{cohort} bé đã chơi</span>
        </> : <p className="overview-empty">Chưa có thao tác chơi được ghi nhận.</p>}
      </section>
      <section className="overview-card overview-creations" data-profile-card="creations">
        <header className="overview-card-heading"><h3><Palette aria-hidden="true"/>Sản phẩm đã tạo</h3>
          <CardAction label="Xem tất cả sản phẩm đã tạo" onClick={()=>setDialog('creations')}>Xem tất cả</CardAction></header>
        <p className="overview-total"><strong>{number.format(creations.length)}</strong> sản phẩm đã gửi</p>
        {creations.length ? <ul className="overview-creation-list">{creations.slice(0,2).map(item=><li key={item.id}>
          <PreviewArt item={item}/><span className="sr-only">{item.title}</span>
        </li>)}</ul> : <p className="overview-empty">Chưa có sản phẩm được gửi về lớp.</p>}
      </section>
    </div>
    <section className="overview-card overview-journey" data-profile-card="journal">
      <h3><Signpost aria-hidden="true"/>Hành trình học tập</h3>
      {recent.length ? <ol>{recent.map(item=><li key={[item.learner_id,item.family,item.id,item.at].join(':')}>
        <time dateTime={item.at}><CalendarDays aria-hidden="true"/>{rosterDate.format(new Date(item.at))}</time>
        <strong title={item.title}>{item.title}</strong>
      </li>)}</ol> : <p className="overview-empty">Chưa có hoạt động trong phạm vi này.</p>}
      <CardAction onClick={()=>setDialog('journey')}>Xem hành trình</CardAction>
    </section>
    {dialog&&<ProfileRecordsDialog key={dialog} {...detail[dialog]} thumbnail={item=><PreviewArt item={item}/>} onClose={()=>setDialog(undefined)}/>}
  </div>;
}
