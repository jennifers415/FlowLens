import 'dotenv/config';
import { createApp } from './app';

const PORT = Number(process.env.PORT || 5055);
const app = createApp();
app.listen(PORT, () => {
    console.log(`FlowLens server listening on http://localhost:${PORT}`);
});
