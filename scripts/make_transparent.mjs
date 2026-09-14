import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const items = [
  ['public/assets/generated/creatures/turtle_isolated.jpg', 'public/assets/generated/creatures/turtle_isolated.png'],
  ['public/assets/generated/creatures/clownfish_isolated.jpg', 'public/assets/generated/creatures/clownfish_isolated.png'],
  ['public/assets/generated/creatures/crab_isolated.jpg', 'public/assets/generated/creatures/crab_isolated.png'],
  ['public/assets/generated/creatures/octopus_isolated.jpg', 'public/assets/generated/creatures/octopus_isolated.png'],
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent('<html><body><canvas id="c"></canvas></body></html>');
  
  for (const [inRel, outRel] of items) {
    const inputPath = path.resolve(inRel);
    const outputPath = path.resolve(outRel);
    
    const imgBase64 = fs.readFileSync(inputPath).toString('base64');
    const dataUri = `data:image/jpeg;base64,${imgBase64}`;
    
    const resultBase64 = await page.evaluate(async (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.getElementById('c');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i+1];
            const b = d[i+2];
            // If close to white
            if (r > 240 && g > 240 && b > 240) {
              d[i+3] = 0; // completely transparent
            } else if (r > 220 && g > 220 && b > 220) {
              // Feather edge
              const factor = (255 - Math.max(r, g, b)) / 35;
              d[i+3] = Math.floor(d[i+3] * factor);
            }
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png').split(',')[1]);
        };
        img.src = src;
      });
    }, dataUri);
    
    fs.writeFileSync(outputPath, Buffer.from(resultBase64, 'base64'));
    console.log('Saved transparent PNG:', outputPath, fs.existsSync(outputPath));
  }
  
  await browser.close();
}

run().catch(console.error);
