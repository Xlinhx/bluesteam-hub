import {useCreativeMotion} from '../../../shared/ui/motion/useCreativeMotion';
import {useEffect,useState} from 'react';
import {Camera,Palette,Box,ScanLine,QrCode,Images,Printer,House} from 'lucide-react';
import {useRouter} from '../../../app/router';
import {LearnerShell} from '../../../shared/shells/LearnerShell';
import {CreativeHubBackdrop} from './components/CreativeHubBackdrop';
import {CraftPaperSurface} from '../../../shared/ui/visuals/CraftPaperSurface';
import {creativeStorage,type CreativeArtwork} from '../../../shared/creative/creativeStorage';
import {selectResumeArtworks} from '../../../shared/creative/artworkLifecycle';
import {CreativeResumeSection} from './components/CreativeResumeSection';
import {ScanLifeIllustration} from './components/ScanLifeIllustration';
import './creativeHub.css';
export function CreativeStudioPage(){
 const motionRoot=useCreativeMotion<HTMLElement>('hub');
 const {navigate}=useRouter();const [drafts,setDrafts]=useState<CreativeArtwork[]>([]),[error,setError]=useState('');
 useEffect(()=>{let active=true;creativeStorage.getArtworks().then(a=>{if(active)setDrafts(selectResumeArtworks(a));}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 return <LearnerShell activeNav="creative"><main ref={motionRoot} className="learner-creative-page creative-hub"><CreativeHubBackdrop/><div className="creative-hub-content"><header className="creative-hub-heading"><span className="creative-hub-badge"><strong>Sáng tạo</strong></span><h1>Góc sáng tạo của nhà thám hiểm nhí.</h1><p>Bé vẽ đại dương - Bé kể chuyện biển xanh</p></header>
 <div className="creative-hub-primary"><CraftPaperSurface className="scan-entry"><header><span className="creative-entry-icon"><ScanLine/></span><div><h2>Cho tranh của bé sống dậy</h2><p>Vẽ trên giấy, quét tranh rồi thả bạn nhỏ vào biển.</p></div></header><ScanLifeIllustration/><footer><button className="creative-hub-button" onClick={()=>navigate('/creative/scan')}><Camera/>Quét tranh của bé</button><button className="creative-hub-button secondary" onClick={()=>navigate('/creative/scan',{query:{join:'1'}})}><QrCode/>Vào phiên bằng mã</button></footer></CraftPaperSurface>
 <CraftPaperSurface className="coloring-entry"><header><span className="creative-entry-icon warm"><Palette/></span><div><h2>Tô màu</h2><p>Chọn tranh yêu thích, tô màu theo ý bé.</p></div></header><div className="creative-coloring-preview"><img src="/assets/creative/c02-reference/coloring-papers.webp" alt="Ba tranh tô màu rùa biển, bạch tuộc và sao biển"/></div><footer><button className="creative-hub-button" onClick={()=>navigate('/creative/coloring')}><Images/>Chọn tranh từ Học liệu</button><button className="creative-hub-button secondary" onClick={()=>navigate('/creative/coloring',{query:{capability:'print'}})}><Printer/>In ra giấy hoặc tô trên màn hình</button></footer></CraftPaperSurface></div>
 <CraftPaperSurface className="habitat-entry"><div className="habitat-entry-copy"><span className="creative-entry-icon warm"><House/></span><div><h2>Xây một nơi sống</h2><p>Chọn cảnh rồi sắp xếp theo ý bé.</p></div></div><img src="/assets/creative/c02-reference/habitat-banner.webp" alt="Sa bàn nơi sống trên khay gỗ"/><button className="creative-hub-button" onClick={()=>navigate('/creative/habitat')}><Box/>Bắt đầu xây</button></CraftPaperSurface>
 <CreativeResumeSection drafts={drafts} error={error}/></div></main></LearnerShell>;
}
