import { Inject, Injectable } from '@nestjs/common';
import type pg from 'pg';
import { csvCell, parseUsageFilter, type UsageFilter, type UsageReport, type UsageDetail, type UsageMetric } from '@bluesteam/contracts';
import { DB_POOL } from '../database/database.module.js';
import { AppError } from '../common/errors.js';
import { resolveMediaPublicUrl } from '../content/resources/resources.service.js';
import { buildUsageAnalysis, type UsageAnalysisEvent } from './analysis/usage-analysis.js';

@Injectable()
export class InteractiveUsageReportService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}
  filter(raw: Record<string, unknown>, now = new Date()) { try { return parseUsageFilter(raw, now); } catch { throw new AppError('INVALID_USAGE_FILTER','Khoảng thời gian không hợp lệ (tối đa 366 ngày).'); } }
  private async databaseNow() { const result = await this.pool.query('SELECT extract(epoch FROM clock_timestamp())*1000 AS ms'); return new Date(Math.ceil(Number(result.rows[0].ms))); }
  private cohort(filter: UsageFilter) {
    return { sql: `r.kind=$1 AND r.opened_at >= $2 AND r.opened_at < $3 AND r.opened_at <= $4
      AND ($5='' OR strpos(lower(r.snapshot->>'title'),lower($5))>0) AND ($6::uuid IS NULL OR r.content_id=$6::uuid)`, params: [filter.kind,filter.from,filter.to,filter.asOf,filter.q || '',filter.contentId || null] };
  }
  async report(raw: Record<string, unknown>): Promise<UsageReport> {
    const filter = this.filter(raw, await this.databaseNow()), cohort = this.cohort(filter);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const migration = await client.query("SELECT applied_at FROM schema_migrations WHERE filename='013_interactive_usage.sql'");
      const availableFrom = new Date(migration.rows[0]?.applied_at || new Date()).toISOString();
      const counts = await client.query(`SELECT count(*)::int opens, count(*) FILTER(WHERE EXISTS(SELECT 1 FROM interactive_usage_interactions e WHERE e.run_id=r.id AND e.received_at<$3 AND e.received_at<=$4))::int interacted, count(DISTINCT(r.content_type,r.content_id))::int activities FROM interactive_usage_runs r WHERE ${cohort.sql}`,cohort.params);
      const total = counts.rows[0];
      const rowsResult = await client.query(`SELECT r.content_type,r.content_id,r.kind,
        (array_agg(r.snapshot->>'title' ORDER BY r.opened_at DESC))[1] title,
        (array_agg(r.snapshot->>'coverUrl' ORDER BY r.opened_at DESC))[1] cover,
        array_agg(DISTINCT r.content_version ORDER BY r.content_version) versions, max(r.opened_at) last_opened,
        count(*)::int opens, count(*) FILTER(WHERE EXISTS(SELECT 1 FROM interactive_usage_interactions e WHERE e.run_id=r.id AND e.received_at<$3 AND e.received_at<=$4))::int interacted
        FROM interactive_usage_runs r WHERE ${cohort.sql} GROUP BY r.content_type,r.content_id,r.kind ORDER BY last_opened DESC,r.content_id LIMIT 51 OFFSET $7`,[...cohort.params,Math.max(0,Number(raw.cursor) || 0)]);
      const dailyResult = await client.query(`SELECT (r.opened_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text AS local_day,count(*)::int opens,
        count(*) FILTER(WHERE EXISTS(SELECT 1 FROM interactive_usage_interactions e WHERE e.run_id=r.id AND e.received_at<$3 AND e.received_at<=$4))::int interacted
        FROM interactive_usage_runs r WHERE ${cohort.sql} GROUP BY local_day`,cohort.params);
      // A selected published activity remains inspectable before its first recorded run.
      // It does not contribute to summary counts or manufacture historical coverage.
      if (filter.contentId && !rowsResult.rows.length && !raw.cursor && filter.to > availableFrom) {
        const table = filter.kind === 'model3d' ? 'models_3d' : 'activities';
        const selected = await client.query(`SELECT c.id,c.title,c.version,c.cover_media_id,m.storage_key
          FROM ${table} c LEFT JOIN media_assets m ON m.id=c.cover_media_id
          WHERE c.id=$1 AND c.visibility IN ('seed','published')
          ${filter.kind === 'model3d' ? '' : 'AND c.kind=$3'}
          AND ($2='' OR strpos(lower(c.title),lower($2))>0)`,
          filter.kind === 'model3d' ? [filter.contentId,filter.q || ''] : [filter.contentId,filter.q || '',filter.kind]);
        const content = selected.rows[0];
        if (content) rowsResult.rows.push({content_type:filter.kind==='model3d'?'model3d':'activity',content_id:content.id,kind:filter.kind,title:content.title,
          cover:resolveMediaPublicUrl(content.storage_key,content.cover_media_id),versions:[content.version],last_opened:null,opens:0,interacted:0});
      }
      await client.query('COMMIT');
      const coverage = filter.to <= availableFrom ? 'not_collected' : filter.from < availableFrom ? 'partial' : 'collected';
      const metric = (n: number, unsupported = false): UsageMetric => ({ value: unsupported || coverage === 'not_collected' ? null : n, coverage: unsupported ? 'not_collected' : coverage, availableFrom });
      const daily = [];
      const startDay = new Date(new Date(filter.from).getTime()+7*3600000).toISOString().slice(0,10);
      for (let day = new Date(`${startDay}T00:00:00+07:00`).getTime(); day < Math.min(new Date(filter.to).getTime(), new Date(filter.asOf).getTime()); day += 86400000) {
        const localDate = new Date(day+7*3600000).toISOString().slice(0,10), row = dailyResult.rows.find(x=>x.local_day===localDate);
        const missing = day+86400000 <= new Date(availableFrom).getTime();
        daily.push({ localDate, opens: missing ? null : row?.opens || 0, interactedRuns: missing || filter.kind==='model3d' ? null : row?.interacted || 0 });
      }
      return { meta: { filter, availableFrom, metricDefinitionVersion: 1, scope: 'standalone_aggregate' }, summary: { opens: metric(total.opens),interactedRuns: metric(total.interacted,filter.kind==='model3d'),usedActivities: metric(total.activities) },
        rows: rowsResult.rows.slice(0,50).map(r=>({ contentType:r.content_type,contentId:r.content_id,kind:r.kind,title:r.title,coverUrl:r.cover,availableVersions:r.versions,defaultVersion:Math.max(...r.versions),lastOpenedAt:r.last_opened?new Date(r.last_opened).toISOString():null,opens:r.opens,interactedRuns:filter.kind==='model3d'?null:r.interacted })), nextCursor: rowsResult.rows.length>50?String((Number(raw.cursor)||0)+50):null,daily };
    } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }
  async detail(contentId: string, raw: Record<string, unknown>): Promise<UsageDetail> {
    const filter = this.filter({...raw,contentId}, await this.databaseNow()), cohort = this.cohort(filter);
    const version = Number(raw.version);
    if (!Number.isInteger(version) || version<1 || !['activity','model3d'].includes(String(raw.contentType))) throw new AppError('INVALID_USAGE_FILTER','Phiên bản không hợp lệ.');
    const client = await this.pool.connect();
    try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const params = [...cohort.params,version,raw.contentType];
    const binding = `${cohort.sql} AND r.content_version=$7 AND r.content_type=$8`;
    const all = await client.query(`SELECT e.id,e.run_id,e.item_id,e.payload,e.result,e.received_at,r.snapshot
      FROM interactive_usage_interactions e JOIN interactive_usage_runs r ON r.id=e.run_id WHERE ${binding} AND e.received_at<$3 AND e.received_at<=$4 ORDER BY e.received_at,e.id`,params);
    const seen = new Set<string>();
    const query = { rows: all.rows.filter(row => { const key = `${row.run_id}:${row.item_id}`; if(seen.has(key))return false;seen.add(key);return true; }) };
    const runs = await client.query(`SELECT count(*)::int count FROM interactive_usage_runs r WHERE ${binding}`,params);
    const latest = await client.query(`SELECT r.snapshot FROM interactive_usage_runs r WHERE ${binding} ORDER BY r.opened_at DESC LIMIT 1`,params);
    const sections: UsageDetail['sections'] = [];
    for(const row of query.rows) {
      let section = sections.find(s=>s.id===row.item_id);
      if(!section) { section={id:row.item_id,label:row.result.label,denominator:0,values:filter.kind==='game'?[{id:'first_incorrect',label:'Chưa đúng ở lần đầu',count:0}]:[]};sections.push(section); }
      section.denominator++;
      const valueId = filter.kind==='game' ? 'first_incorrect' : row.payload.choiceId || row.item_id;
      if(filter.kind==='game' && row.result.correct) continue;
      let value=section.values.find(v=>v.id===valueId);
      if(!value){value={id:valueId,label:filter.kind==='game'?'Chưa đúng ở lần đầu':row.result.choiceLabel || row.result.label,count:0};section.values.push(value);}
      value.count++;
    }
    const interacted = new Set(query.rows.map(x=>x.run_id)).size;
    if(filter.kind==='simulation') for(const section of sections) {
      if(section.values.every(value=>value.id===section.id)) section.denominator=interacted;
    }
    const daily: Array<{localDate:string;opens:number|null}> = [];
    if (filter.kind === 'model3d') {
      const migration = await client.query("SELECT applied_at FROM schema_migrations WHERE filename='013_interactive_usage.sql'");
      const availableFrom = new Date(migration.rows[0]?.applied_at || new Date()).getTime();
      const byDay = await client.query(`SELECT (r.opened_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text local_day,count(*)::int opens FROM interactive_usage_runs r WHERE ${binding} GROUP BY local_day`,params);
      const startDay = new Date(new Date(filter.from).getTime()+7*3600000).toISOString().slice(0,10);
      for(let day=new Date(`${startDay}T00:00:00+07:00`).getTime();day<Math.min(new Date(filter.to).getTime(),new Date(filter.asOf).getTime());day+=86400000){
        const localDate=new Date(day+7*3600000).toISOString().slice(0,10);
        daily.push({localDate,opens:day+86400000<=availableFrom?null:byDay.rows.find(row=>row.local_day===localDate)?.opens||0});
      }
    }
    const events: UsageAnalysisEvent[] = all.rows.map(row => ({ id:row.id,receivedAt:new Date(row.received_at).toISOString(),runId:row.run_id,itemId:row.item_id,payload:row.payload,result:row.result,snapshot:row.snapshot }));
    const analysis=buildUsageAnalysis({kind:filter.kind,snapshot:latest.rows[0]?.snapshot,events,daily});
    await client.query('COMMIT');
    return {kind:filter.kind,version,opens:runs.rows[0].count,interactedRuns:filter.kind==='model3d'?null:interacted,sections,analysis};
    } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }
  async csv(raw: Record<string, unknown>) {
    const first = await this.report(raw);
    const reports = [first];
    let cursor=first.nextCursor;
    while(cursor) { const report=await this.report({...raw,...first.meta.filter,cursor});reports.push(report);cursor=report.nextCursor; }
    const lines: unknown[][] = [['Phạm vi','standalone_aggregate'],['Từ',first.meta.filter.from],['Đến (không gồm)',first.meta.filter.to],['Múi giờ','Asia/Saigon'],['Chốt lúc',first.meta.filter.asOf],['Định nghĩa',1],['Bắt đầu hỗ trợ ghi nhận',first.meta.availableFrom],['Loại','Nội dung','Phiên bản','Mục','Lựa chọn','Số lượt','Mẫu số']];
    const requestedVersion=raw.version===undefined?undefined:Number(raw.version);
    if(requestedVersion!==undefined&&(!Number.isInteger(requestedVersion)||requestedVersion<1))throw new AppError('INVALID_USAGE_FILTER','Phiên bản không hợp lệ.');
    for(const report of reports) for(const row of report.rows) for(const version of row.availableVersions.filter(version=>requestedVersion===undefined||version===requestedVersion)) {
      const detail=await this.detail(row.contentId,{...first.meta.filter,version,contentType:row.contentType});
      lines.push([row.kind,row.title,version,'Lượt mở','',detail.opens,'']);
      const analysis=detail.analysis;
      if(analysis?.type==='game_first_answer') for(const item of analysis.items){
        lines.push([row.kind,row.title,version,item.label,'Chưa đúng ở lần đầu',item.firstIncorrectRuns,item.answeredRuns]);
        for(const answer of item.answers)lines.push([row.kind,row.title,version,item.label,answer.label,answer.count,item.answeredRuns]);
      }
      else if(analysis?.type==='simulation_steps')for(const step of analysis.steps)lines.push([row.kind,row.title,version,step.label,'Có thao tác tại chặng',step.visitedRuns,analysis.interactedRuns]);
      else if(analysis?.type==='simulation_choices'||analysis?.type==='scenario_choices')for(const section of analysis.type==='scenario_choices'?analysis.scenes:analysis.steps)for(const choice of section.choices)lines.push([row.kind,row.title,version,section.label,choice.label,choice.count,section.answeredRuns]);
      else if(analysis?.type==='model_opens')for(const day of analysis.daily)lines.push([row.kind,row.title,version,day.localDate,'Lượt mở',day.opens,'']);
      else for(const section of detail.sections) for(const value of section.values) lines.push([row.kind,row.title,version,section.label,value.label,value.count,section.denominator]);
    }
    lines.push([],['Ngày mở','Lượt mở','Lượt có tương tác']);
    for(const day of first.daily) lines.push([day.localDate,day.opens,day.interactedRuns]);
    return '\uFEFF'+lines.map(line=>line.map(csvCell).join(',')).join('\r\n');
  }
}
