# FlowLens

FlowLens is an analysis platform that visualizes user interaction in real time 
with heatmaps.

# Setup
git clone https://github.com/jennifers415/flowlens.git

1. Installing required packages
npm install
cd packages/sdk && npm install
cd ../server && npm install
cd ../dashboard && npm install

2. Starting components
- Server
cd packages/server
cp .env.example .env
npm run dev
- Dashboard
cd packages/dashboard
npm run dev
- Building SDK
cd packages/sdk
npm run build

3. Embedding SDK to additional HTML pages
`<script src="/path/to/flowlens-sdk.umd.js"></script>
<script>
FlowLensSDK.init({
siteId: '{siteid}',
serverUrl: 'http://localhost:5055'
});
</script>`