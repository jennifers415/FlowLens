# FlowLens

FlowLens is an analysis platform that visualizes user interaction in real time 
with heatmaps.

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/jennifers415/flowlens.git
```

### 2. Installing required packages
```bash
npm install
cd packages/sdk && npm install
cd ../server && npm install
cd ../dashboard && npm install
```

### 3. Starting components
- Server
```bash
cd packages/server
cp .env.example .env
npm run dev
```
- Dashboard
```bash
cd packages/dashboard
npm run dev
```
- Building SDK
```bash
cd packages/sdk
npm run build
```
### Embedding SDK to additional HTML pages
```html
<script src="/path/to/flowlens-sdk.umd.js"></script>
<script>
FlowLensSDK.init({
  siteId: '{siteid}',
  serverUrl: 'http://localhost:5055'
});
</script>
```