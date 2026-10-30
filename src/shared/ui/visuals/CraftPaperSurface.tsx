import type {ReactNode} from 'react';
import './craft-surfaces.css';
export function CraftPaperSurface({children,className=''}:{children:ReactNode;className?:string}){return <section className={`craft-paper-surface ${className}`}>{children}</section>;}
