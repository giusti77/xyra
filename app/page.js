import fs from 'fs';
import path from 'path';

export default function Home() {
  // Lê o HTML original
  const htmlPath = path.join(process.cwd(), 'app/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
