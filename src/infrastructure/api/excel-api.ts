import type { Faturamento, ExcelSchema } from '@domain/models/faturamento';

export class ExcelApi {
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static async parseFile(base64File: string): Promise<Faturamento[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../workers/excel-worker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (e) => {
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.data as Faturamento[]);
        }
        worker.terminate();
      };

      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };

      worker.postMessage({ type: 'parse', base64: base64File });
    });
  }

  static async fetchDefault(): Promise<Faturamento[]> {
    const response = await fetch('/POWERBI.xlsx');
    if (!response.ok) throw new Error('Could not fetch default file');
    const blob = await response.blob();
    const base64 = await this.blobToBase64(blob);
    return this.parseFile(base64);
  }

  /**
   * Refactored to use Web Workers and AOA (Array of Arrays) for extreme performance.
   * Complies with Rule 18 and improves UX by not blocking the main thread.
   */
  static async inspectFile(base64File: string): Promise<ExcelSchema> {
    return new Promise((resolve, reject) => {
      // Vite handles worker import beautifully
      const worker = new Worker(new URL('../workers/excel-worker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (e) => {
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data as ExcelSchema);
        }
        worker.terminate();
      };

      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };

      worker.postMessage({ type: 'inspect', base64: base64File });
    });
  }
}
