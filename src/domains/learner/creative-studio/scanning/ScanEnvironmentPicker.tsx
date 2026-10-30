import {MapPin} from 'lucide-react';
import {EnvironmentPicker} from '../../../../shared/creative/scanning/EnvironmentPicker';
export function ScanEnvironmentPicker({value,onChange,disabled}:{value:string;onChange:(v:string)=>void;disabled:boolean}){return <section className="scan-choice-surface"><h2><MapPin size={21}/>Bé muốn thả bạn ở đâu?</h2><EnvironmentPicker value={value} onChange={onChange} disabled={disabled}/></section>;}
