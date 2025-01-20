<template>
  <main class="container">
    <h1>Upload and Process File</h1>

    <div class="grid">
      <div>
        <label class="file-upload">
          <i class="fas fa-upload"></i> Select .Dat File
          <input type="file" @change="handleFileUpload" hidden />
        </label>
      </div>
    </div>

    <div class="log-area">
      <textarea
        v-model="logContent"
        readonly
        placeholder="Logs will appear here..."
      ></textarea>
    </div>

    <button class="primary" @click="downloadLogFile">
      <i class="fas fa-download"></i> Download Log
    </button>
  </main>
</template>


<script lang="ts">
import { defineComponent, ref, nextTick } from 'vue';
import * as anuityProcessor from '../services/annuityProcessor';

import ExcelJS from 'exceljs';

export default defineComponent({
  setup() {
    const logs = ref<string[]>([]);

    const logContent = ref<string>('');
    const logMessage = async (message: string) => {
      logs.value.push(`${new Date().toISOString()}] ${message}`);
      logContent.value = logs.value.join('\n');

      await nextTick(() => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        textarea.scrollTop = textarea.scrollHeight;
      });
    };

    const handleFileUpload = async (event: Event) => {
      const fileInput = event.target as HTMLInputElement;
      if (!fileInput.files?.length) {
        alert('Please select a file');
        return;
      }
      const file = fileInput.files[0];
      await logMessage(' [INF] File selected: ' + file.name);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target?.result as string;
        await processFile(fileContent);
      };
      reader.readAsText(file);
    };

    const processFile = async (content: string) => {
      await logMessage(' [INF] Processing file...');

      const ap = new anuityProcessor.AnnuityProcessor();

      const processResult = await ap.process(content);

      processResult.messages.forEach(element => {
        logMessage(element);  
      });

     

    };

    const downloadLogFile = () => {
      const blob = new Blob([logContent.value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'log.txt';
      link.click();
    };

    return {
      logContent,
      handleFileUpload,
      downloadLogFile
    };
  }
});
</script>

<style scoped>
/* Override Pico default styles if necessary */
.container {
  max-width: 1480px;
  margin: auto;
  text-align: center;
  padding: 2rem;
  font-size: 1rem;
}

.file-upload {
  background-color: var(--primary);
  color: #2a1313;
  padding: 1rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block;
  
}

.file-upload:hover {
  background-color: var(--primary-hover);
}

.log-area {
  width: 100%;
  max-width: 1080px;
  margin: 2rem auto;
}

textarea {
  width: 100%;
  height: 300px;
  padding: 1rem;
  font-size: 0.75rem;
  border-radius: 5px;
  border: 1px solid var(--secondary);
  box-shadow: var(--shadow-sm);
  resize: none;
}

.primary {
  padding: 1rem 2rem;
  border: none;
  background-color: var(--primary);
  color: #0e0505;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
}

.primary:hover {
  background-color: var(--primary-hover);
}
</style>
