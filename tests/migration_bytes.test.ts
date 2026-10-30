import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Checksums of SQL already applied in the local database copied to production.
const applied = {
  "001_bluesteam_r2_schema.sql": "a3bea00b21071e272fe8e4f8469565b111b2788cc77acab75ea7b40897f5cbcb",
  "002_resource_groups.sql": "1d37e668be7169361169c3699298b8203772195d8f749e9486cc347f9d439ba5",
  "003_creative_working_copies.sql": "e8761dcb89910890595333ea7921c54a00f6fa65438f3c7a7af3d819cb2a125e",
  "004_creative_edit_versions.sql": "89d4988d09f070660faaff48a7ceec13d0f1f7d24d1d61c081ccd65f8c9a0f90",
  "004_resource_link_order.sql": "337f9ea638a2cfd538426a8c190388f31a617c5e964bda458e26ab9040b70e2e",
  "005_activity_working_copies.sql": "29b30cc2dc84c135d0e64357115b64c51bd78c3c44016dd05a878419af1f5317",
  "006_interactive_groups.sql": "990828f1af6a1a5296e6499f9a65e4c84d67616358f8b0d4cd38ed7f0cf42d6c",
  "007_resource_member_order.sql": "7041b89f0d87db95f2aa7d2ebaaba6040274687b5178850126b79213185ba729",
  "008_teacher_avatar.sql": "4910312ee17e90584ca3fcf052ac7d12dbe39fc6fcd83faf64ce622c2aa3c138",
  "009_resource_visibility_without_drafts.sql": "bd685e58c4f05b9da346d83dc81e97f8b83ef0c826e1c555c1d60e14d8e6fc75",
  "010_detach_artwork_ownership.sql": "f2da223016847b4c0f6ae56855b09a7d5419c119d0e5885e715f1b3f6c0024da",
  "011_backfill_artwork_ownership.sql": "75288a216550e1a48630a2127c52c592e6c2439ae0ee6f64d8102206bf8b6393",
  "012_retire_rooms.sql": "57c696f50adf698f9e9156d00098003e1bc32a09606307f44f707105da18647d",
  "013_interactive_usage.sql": "534b644a2c066432bb2ee9db61af32c5aa2195bc157cdb01baade1ee5cf4e5b1",
  "014_creative_scan_sessions.sql": "5aafc29c223fc9bcca61bab9c1bcc7229cf83cbb247ef954a2d1cdbc724b3ccc",
  "015_creative_session_media.sql": "702c46fd88a3aaaa09b38574b0c3fa90c368586949dcf0c368b06e6d4caf764c",
  "016_learner_accounts.sql": "215d3f61a1d14a5298bd24017c0804c24fc435154a2b49f875dc18356c30e4aa",
  "017_creative_challenges.sql": "07b89e89b90b66bc3fb76969acecb09d08b19ec15f9421167e99f944cad83192",
  "018_creative_coloring_usage.sql": "f9dc2fef62a192911b4404ff3fa9c5a2e5d6c29eb942232fa2234b4abd7896f0"
};

describe('Applied database migration compatibility', () => {
  it('retains the exact bytes of every applied migration, including whitespace and line endings', () => {
    for (const [filename, checksum] of Object.entries(applied)) {
      const bytes = readFileSync(`server/src/database/migrations/${filename}`);
      expect(createHash('sha256').update(bytes).digest('hex'), filename).toBe(checksum);
    }
  });
});
