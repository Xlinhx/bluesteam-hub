import React from 'react';
import {renderToString} from 'react-dom/server';
import {expect,it} from 'vitest';
import {EnvironmentPicker} from '../src/shared/creative/scanning/EnvironmentPicker';

it('bounds a growing environment catalogue to six previews per page while preserving selection and search',()=>{
 const environments=Array.from({length:14},(_,i)=>({id:`sea-${i}`,title:`Biển ${i}`,color:'#cef',preview:'/sea.webp'}));
 const html=renderToString(<EnvironmentPicker environments={environments} value="sea-12" onChange={()=>{}}/>).replace(/<!--.*?-->/g,'');
 expect(html).toContain('Tìm môi trường');
 expect(html).toContain('Trang 1 / 3');
 expect((html.match(/data-environment-option=/g)||[]).length).toBe(6);
 expect(html).toContain('Đang chọn: Biển 12');
 expect(html).not.toContain('data-environment-option="sea-6"');
});
