import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: false,  // 端口被占用时自动尝试下一个端口
    open: true           // 自动打开浏览器
}
});
