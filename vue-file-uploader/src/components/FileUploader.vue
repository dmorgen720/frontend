<template>
  <div class="container">
   
    <div class="file-input">
      <label class="upload-btn"><i class="fas fa-upload"></i> Select .Dat File<input type="file" @change="handleFileUpload" hidden /></label>
    </div>
    <textarea v-model="logContent" readonly placeholder="Logs will appear here..."></textarea>
    <button class="button" @click="downloadLogFile">
      <i class="fas fa-download"></i> Download Log
    </button>
  </div>
</template>

<script>
import ExcelJS from 'exceljs';

export default {
  data() {
    return {
      logs: []
    };
  },
  computed: {
    logContent() {
      return this.logs.join('\n');
    }
  },

  methods: {

    async logMessage(level, message) {
      this.logs.push(`[${new Date().toISOString()}] [${level}] ${message}`);
      this.$nextTick(() => {
        const textarea = document.querySelector('textarea');
        textarea.scrollTop = textarea.scrollHeight;
      });
      await new Promise(resolve => setTimeout(resolve, 0));  // Simulate async operation
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) {
        alert('Please select a file');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;
        this.processFile(fileContent);
      };
      reader.readAsText(file);
    },

    async processFile(content) {
      await this.logMessage('INF', 'Processing file...');
      const rows = content.split('\n');
      const filteredRows = rows.filter(row => row.substring(0, 2) === 'AG');

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('FilteredData');

      worksheet.columns = [
        { header: 'Field1', key: 'field1' },
        { header: 'Field2', key: 'field2' },
        { header: 'Field3', key: 'field3' },
        { header: 'Field4', key: 'field4' },
        { header: 'Field5', key: 'field5' }
      ];

      filteredRows.forEach(row => {
        worksheet.addRow({
          field1: row.substring(0, 2),
          field2: row.substring(2, 5),
          field3: row.substring(5, 8),
          field4: row.substring(8, 12),
          field5: row.substring(12, 15),
        });
         this.logMessage('INF', 'Added row to worksheet ' + row.substring(2, 5));
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'result.xlsx';
      link.click();
      await this.logMessage('INF', 'File processed and downloaded.');
    },

    downloadLogFile() {
      const blob = new Blob([this.logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'log.txt';
      link.click();
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  text-align: center;
}
.upload-btn {
  background-color: #007BFF;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.upload-btn:hover {
  background-color: #0056b3;
}
textarea {
  width: 100%;
  height: 500px;
  margin-top: 20px;
  padding: 10px;
  overflow-y: auto;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
