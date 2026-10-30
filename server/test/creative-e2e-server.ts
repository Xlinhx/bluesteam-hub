import {createDatabasePool,assertTestDatabaseUrl} from '../src/database/pool.js';
import {runMigrations} from '../src/database/migrate.js';
import {importSeed} from '../src/database/seeds/import-seed.js';
import {createServerApp} from '../src/bootstrap.js';
import {AuthService} from '../src/auth/auth.service.js';
import path from 'node:path';
const databaseUrl=process.env.TEST_DATABASE_URL||'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_test';
assertTestDatabaseUrl(databaseUrl);
const pool=createDatabasePool(databaseUrl);await runMigrations(pool);await importSeed({mode:'content',dryRun:false,archiveDir:path.resolve('server/seed-data'),dbClient:pool});await pool.end();
const server=await createServerApp({databaseUrl,port:8012,mediaStorageDir:path.resolve('artifacts/creative-teacher-test-media')});await server.app.get(AuthService).upsertTeacherAccount({email:'creative-e2e@test.local',password:'Testing123!',displayName:'Cô Linh'});
console.log('Creative test API ready at '+server.url);
try{await server.app.get(AuthService).registerAccount({role:'student',email:'creative-child@test.local',password:'Testing123!',displayName:'Hà'},'creative-e2e');}catch(e){if((e as any).code!=='EMAIL_ALREADY_REGISTERED')throw e;}
